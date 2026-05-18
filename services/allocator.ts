import mongoose from "mongoose";

import Provider from "@/models/Provider";
import Assignment from "@/models/Assignment";
import AllocationState from "@/models/AllocationState";

import {
  MANDATORY_PROVIDERS,
  FAIR_DISTRIBUTION_POOLS,
} from "@/lib/constants";

export async function allocateLead(
  leadId: string,
  serviceType: string
) {
  const maxRetries = 5;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const assignedProviders: number[] = [];

      // STEP 1 — Mandatory Providers

      const mandatoryProviders =
        MANDATORY_PROVIDERS[serviceType] || [];

      for (const providerNumber of mandatoryProviders) {
        const provider = await Provider.findOne({
          name: `Provider ${providerNumber}`,
        });

        if (
          provider &&
          provider.leadsAssigned < provider.monthlyQuota
        ) {
          assignedProviders.push(providerNumber);

          await Assignment.create({
            leadId,
            providerId: provider._id,
          });

          await Provider.findByIdAndUpdate(
            provider._id,
            { $inc: { leadsAssigned: 1 } }
          );
        }
      }

      // STEP 2 — Fair Distribution

      const remainingSlots = 3 - assignedProviders.length;

      if (remainingSlots > 0) {
        const pool =
          FAIR_DISTRIBUTION_POOLS[serviceType] || [];

        let allocationState =
          await AllocationState.findOne({
            serviceType,
          });

        if (!allocationState) {
          allocationState = await AllocationState.create({
            serviceType,
            currentIndex: 0,
          });
        }

        let currentIndex = allocationState.currentIndex;

        let added = 0;

        let checked = 0;

        while (
          added < remainingSlots &&
          checked < pool.length * 2
        ) {
          const providerNumber =
            pool[currentIndex % pool.length];

          currentIndex++;

          checked++;

          if (
            assignedProviders.includes(providerNumber)
          ) {
            continue;
          }

          const provider = await Provider.findOne({
            name: `Provider ${providerNumber}`,
          });

          if (
            provider &&
            provider.leadsAssigned < provider.monthlyQuota
          ) {
            assignedProviders.push(providerNumber);

            await Assignment.create({
              leadId,
              providerId: provider._id,
            });

            await Provider.findByIdAndUpdate(
              provider._id,
              { $inc: { leadsAssigned: 1 } }
            );

            added++;
          }
        }

        await AllocationState.findOneAndUpdate(
          { serviceType },
          { currentIndex }
        );

        // STEP 3 — Fallback Allocation

        if (assignedProviders.length < 3) {
          const allProviders = await Provider.find();

          for (const provider of allProviders) {
            const providerNumber = Number(
              provider.name.split(" ")[1]
            );

            if (
              assignedProviders.includes(
                providerNumber
              )
            ) {
              continue;
            }

            if (
              provider.leadsAssigned >=
              provider.monthlyQuota
            ) {
              continue;
            }

            assignedProviders.push(providerNumber);

            await Assignment.create({
              leadId,
              providerId: provider._id,
            });

            await Provider.findByIdAndUpdate(
              provider._id,
              { $inc: { leadsAssigned: 1 } }
            );

            if (assignedProviders.length === 3) {
              break;
            }
          }
        }
      }

      return assignedProviders;
    } catch (error: any) {
      // Check if it's a write conflict or duplicate key error
      if (
        (error.message?.includes('Write conflict') ||
         error.code === 11000 ||
         error.message?.includes('duplicate')) &&
        retryCount < maxRetries - 1
      ) {
        retryCount++;
        // Exponential backoff: 100ms, 200ms, 400ms, 800ms
        const delay = Math.pow(2, retryCount) * 100;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      throw error;
    }
  }

  throw new Error('Max retries exceeded');
}