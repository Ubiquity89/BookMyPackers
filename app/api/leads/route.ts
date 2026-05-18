import { connectDB } from "@/lib/db";
import Lead from "@/models/Lead";
import { allocateLead } from "@/services/allocator";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    // Validate required fields
    if (!body.phone || !body.serviceType) {
      return Response.json(
        { success: false, message: "Phone and serviceType are required" },
        { status: 400 }
      );
    }

    const lead = await Lead.create(body);

    const assignedProviders = await allocateLead(
      lead._id.toString(),
      lead.serviceType
    );

    return Response.json({
      success: true,
      lead,
      assignedProviders,
    });

  } catch (error: any) {
    console.error("Error in /api/leads:", error);

    // Trap duplicate unique index clashes
    if (error.code === 11000 || error.message?.includes("E11000")) {
      return Response.json(
        {
          success: false,
          message: "Duplicate lead: This phone number already has a request for this service type",
        },
        { status: 400 }
      );
    }

    if (error.name === 'ValidationError') {
      return Response.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    return Response.json(
      { success: false, message: error.message || "Internal server error occurred" },
      { status: 500 }
    );
  }
}