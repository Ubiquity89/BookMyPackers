import { connectDB } from "@/lib/db";

import Provider from "@/models/Provider";
import Assignment from "@/models/Assignment";
import Lead from "@/models/Lead";

export async function GET() {
  try {
    await connectDB();

    const providers = await Provider.find();

    const providerIds = providers.map(p => p._id);

    // Fetch all assignments for all providers in one query
    const assignments = await Assignment.find({
      providerId: { $in: providerIds },
    });

    // Get all unique lead IDs
    const leadIds = [...new Set(assignments.map(a => a.leadId))];

    // Fetch all leads in one query
    const leadsMap = new Map();
    if (leadIds.length > 0) {
      const leads = await Lead.find({ _id: { $in: leadIds } });
      leads.forEach(lead => leadsMap.set(lead._id.toString(), lead));
    }

    // Group assignments by provider
    const assignmentsByProvider = new Map();
    assignments.forEach(assignment => {
      const providerId = assignment.providerId.toString();
      if (!assignmentsByProvider.has(providerId)) {
        assignmentsByProvider.set(providerId, []);
      }
      assignmentsByProvider.get(providerId).push(assignment);
    });

    const dashboardData = [];

    for (const provider of providers) {
      const providerAssignments = assignmentsByProvider.get(provider._id.toString()) || [];

      const leads = providerAssignments
        .map((assignment: any) => leadsMap.get(assignment.leadId.toString()))
        .filter((lead: any) => lead !== undefined);

      dashboardData.push({
        providerName: provider.name,
        remainingQuota:
          provider.monthlyQuota -
          provider.leadsAssigned,
        leadsReceived:
          provider.leadsAssigned,
        leads,
      });
    }

    return Response.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}