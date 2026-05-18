import mongoose from "mongoose";
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

    // Use a session to ensure Lead creation and Allocator are treated as an single, inseparable block
    const session = await mongoose.startSession();
    let assignedProviders: number[] = [];
    let lead;

    try {
      await session.withTransaction(async () => {
        // Create the lead tied directly to the current session block
        const [newLead] = await Lead.create([body], { session });
        lead = newLead;

        // Run the atomic allocation logic
        assignedProviders = await allocateLead(
          lead._id.toString(),
          lead.serviceType
        );
      });
    } finally {
      await session.endSession();
    }

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
      { success: false, message: "Internal server error occurred" },
      { status: 500 }
    );
  }
}