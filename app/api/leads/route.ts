import { connectDB } from "@/lib/db";

import Lead from "@/models/Lead";

import { allocateLead } from "@/services/allocator";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const lead = await Lead.create(body);

    const assignedProviders =
      await allocateLead(
        lead._id.toString(),
        lead.serviceType
      );

    return Response.json({
      success: true,
      lead,
      assignedProviders,
    });
  } catch (error: any) {
    console.log(error);

    if (error.code === 11000) {
      return Response.json(
        {
          success: false,
          message:
            "Duplicate lead for same service",
        },
        {
          status: 400,
        }
      );
    }

    return Response.json(
      {
        success: false,
        message: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}