import { connectDB } from "@/lib/db";

import Provider from "@/models/Provider";
import Assignment from "@/models/Assignment";
import Lead from "@/models/Lead";

export async function GET() {
  try {
    await connectDB();

    const providers = await Provider.find();

    const dashboardData = [];

    for (const provider of providers) {
      const assignments = await Assignment.find({
        providerId: provider._id,
      });

      const leads = [];

      for (const assignment of assignments) {
        const lead = await Lead.findById(
          assignment.leadId
        );

        if (lead) {
          leads.push(lead);
        }
      }

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
    console.log(error);

    return Response.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}