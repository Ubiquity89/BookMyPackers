import mongoose from "mongoose";
import Provider from "@/models/Provider";
import Assignment from "@/models/Assignment";
import AllocationState from "@/models/AllocationState";
import {
  MANDATORY_PROVIDERS,
  FAIR_DISTRIBUTION_POOLS,
} from "@/lib/constants";

export async function allocateLead(leadId: string, serviceType: string) {
  const maxRetries = 5;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    // Start a managed MongoDB Session for handling distributed concurrency transactions
    const session = await mongoose.startSession();
    try {
      let assignedProviders: number[] = [];
      session.startTransaction();

      // STEP 1 — Mandatory Providers
      const mandatoryProviders = MANDATORY_PROVIDERS[serviceType] || [];

      for (const providerNumber of mandatoryProviders) {
        // ATOMIC ATTEMPT: Try to increment the count ONLY if it is strictly below the ceiling limit
        const updatedProvider = await Provider.findOneAndUpdate(
          {
            name: `Provider ${providerNumber}`,
            $expr: { $lt: ["$leadsAssigned", "$monthlyQuota"] } // Atomic check inside the DB engine
          },
          { $inc: { leadsAssigned: 1 } },
          { session, new: true }
        );

        if (updatedProvider) {
          assignedProviders.push(providerNumber);
          await Assignment.create(
            [{ leadId, providerId: updatedProvider._id }],
            { session }
          );
        }
      }

      // STEP 2 — Fair Distribution
      let remainingSlots = 3 - assignedProviders.length;

      if (remainingSlots > 0) {
        const pool = FAIR_DISTRIBUTION_POOLS[serviceType] || [];
        
        // Find and explicitly apply a write lock on the tracker index
        let allocationState = await AllocationState.findOneAndUpdate(
          { serviceType },
          { $setOnInsert: { serviceType, currentIndex: 0 } },
          { session, upsert: true, new: true }
        );

        let currentIndex = allocationState.currentIndex;
        let added = 0;
        let checked = 0;

        while (added < remainingSlots && checked < pool.length * 2) {
          const providerNumber = pool[currentIndex % pool.length];
          currentIndex++;
          checked++;

          if (assignedProviders.includes(providerNumber)) {
            continue;
          }

          // ATOMIC ATTEMPT for the Round-Robin Pool selection
          const updatedProvider = await Provider.findOneAndUpdate(
            {
              name: `Provider ${providerNumber}`,
              $expr: { $lt: ["$leadsAssigned", "$monthlyQuota"] }
            },
            { $inc: { leadsAssigned: 1 } },
            { session, new: true }
          );

          if (updatedProvider) {
            assignedProviders.push(providerNumber);
            await Assignment.create(
              [{ leadId, providerId: updatedProvider._id }],
              { session }
            );
            added++;
          }
        }

        // Commit the final state pointer position
        await AllocationState.updateOne(
          { serviceType },
          { $set: { currentIndex } },
          { session }
        );
      }

      // STEP 3 — Fallback Allocation (If pool fails or is fully exhausted)
      remainingSlots = 3 - assignedProviders.length;
      if (remainingSlots > 0) {
        const allProviders = await Provider.find({}).session(session);

        for (const provider of allProviders) {
          const providerNumber = Number(provider.name.split(" ")[1]);

          if (assignedProviders.includes(providerNumber)) {
            continue;
          }

          const updatedProvider = await Provider.findOneAndUpdate(
            {
              _id: provider._id,
              $expr: { $lt: ["$leadsAssigned", "$monthlyQuota"] }
            },
            { $inc: { leadsAssigned: 1 } },
            { session, new: true }
          );

          if (updatedProvider) {
            assignedProviders.push(providerNumber);
            await Assignment.create(
              [{ leadId, providerId: updatedProvider._id }],
              { session }
            );
            remainingSlots--;
          }

          if (assignedProviders.length === 3) {
            break;
          }
        }
      }

      // If the allocation requirements are entirely met, lock it into the database permanently
      await session.commitTransaction();
      return assignedProviders;

    } catch (error: any) {
      // Cleanly abort everything modified within this cycle if a transaction clash happens
      await session.abortTransaction();

      const isConflict = 
        error.message?.includes('Write conflict') || 
        error.code === 11000 || 
        error.hasErrorLabel?.('TransientTransactionError');

      if (isConflict && retryCount < maxRetries - 1) {
        retryCount++;
        const delay = Math.pow(2, retryCount) * 100;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    } finally {
      await session.endSession();
    }
  }

  throw new Error('Max retries exceeded or concurrency constraints completely saturated');
}