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
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const assignedProviders: number[] = [];

      // STEP 1 — Mandatory Providers

      const mandatoryProviders =
        MANDATORY_PROVIDERS[serviceType] || [];

      for (const providerNumber of mandatoryProviders) {
        const provider = await Provider.findOne({
          name: `Provider ${providerNumber}`,
        }).session(session);

        if (
          provider &&
          provider.leadsAssigned < provider.monthlyQuota
        ) {
          assignedProviders.push(providerNumber);

          await Assignment.create(
            [
              {
                leadId,
                providerId: provider._id,
              },
            ],
            { session }
          );

          provider.leadsAssigned += 1;

          await provider.save({ session });
        }
      }

      // STEP 2 — Fair Distribution

      const remainingSlots = 3 - assignedProviders.length;

      if (remainingSlots > 0) {
        const pool =
          FAIR_DISTRIBUTION_POOLS[serviceType] || [];

        const allocationState =
          await AllocationState.findOne({
            serviceType,
          }).session(session);

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
          }).session(session);

          if (
            provider &&
            provider.leadsAssigned < provider.monthlyQuota
          ) {
            assignedProviders.push(providerNumber);

            await Assignment.create(
              [
                {
                  leadId,
                  providerId: provider._id,
                },
              ],
              { session }
            );

            provider.leadsAssigned += 1;

            await provider.save({ session });

            added++;
          }
        }

        allocationState.currentIndex = currentIndex;

        await allocationState.save({ session });

        // STEP 3 — Fallback Allocation

        if (assignedProviders.length < 3) {
          const allProviders = await Provider.find().session(
            session
          );

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

            await Assignment.create(
              [
                {
                  leadId,
                  providerId: provider._id,
                },
              ],
              { session }
            );

            provider.leadsAssigned += 1;

            await provider.save({ session });

            if (assignedProviders.length === 3) {
              break;
            }
          }
        }
      }

      await session.commitTransaction();

      return assignedProviders;
    } catch (error: any) {
      await session.abortTransaction();

      // Check if it's a write conflict error
      if (error.message?.includes('Write conflict') && retryCount < maxRetries - 1) {
        retryCount++;
        // Exponential backoff: 100ms, 200ms, 400ms, 800ms
        const delay = Math.pow(2, retryCount) * 100;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      throw error;
    } finally {
      session.endSession();
    }
  }

  throw new Error('Max retries exceeded');
}