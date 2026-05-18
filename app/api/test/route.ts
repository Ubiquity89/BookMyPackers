import { connectDB } from "@/lib/db";
import Lead from "@/models/Lead";
import { allocateLead } from "@/services/allocator";

export async function POST() {
  try {
    await connectDB();

    const results = [];

    // Run sequentially to avoid write conflicts in MongoDB Atlas
    for (let i = 0; i < 10; i++) {
      const leadData = {
        name: `User ${i}`,
        phone: `99999${Math.floor(
          10000 + Math.random() * 90000
        )}${Date.now()}${i}`,
        city: "Delhi",
        serviceType:
          i % 3 === 0
            ? "Service 1"
            : i % 3 === 1
            ? "Service 2"
            : "Service 3",
        description: "Concurrency test lead",
      };

      const lead = await Lead.create(leadData);

      const assignedProviders =
        await allocateLead(
          lead._id.toString(),
          lead.serviceType
        );

      results.push({ lead, assignedProviders });

      // Small delay between operations to reduce write conflicts
      if (i < 9) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return Response.json({
      success: true,
      message: "10 leads generated sequentially",
      results,
    });
  } catch (error) {
    console.error("Test API Error:", error);

    return Response.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}