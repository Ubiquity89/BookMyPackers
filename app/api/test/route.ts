import { connectDB } from "@/lib/db";
import Lead from "@/models/Lead";
import { allocateLead } from "@/services/allocator";

export async function POST() {
  try {
    await connectDB();

    const promises = [];

    for (let i = 0; i < 10; i++) {
      promises.push(
        (async () => {
          const leadData = {
            name: `User ${i}`,
            phone: `99999${Math.floor(
              10000 + Math.random() * 90000
            )}`,
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

          return { lead, assignedProviders };
        })()
      );
    }

    const results = await Promise.all(promises);

    return Response.json({
      success: true,
      message: "10 concurrent leads generated",
      results,
    });
  } catch (error) {
    console.log(error);

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