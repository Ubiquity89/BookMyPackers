import { connectDB } from "@/lib/db";
import Provider from "@/models/Provider";
import AllocationState from "@/models/AllocationState";
import { SERVICES } from "@/lib/constants";

export async function GET() {
  try {
    await connectDB();

    const existingProviders = await Provider.countDocuments();

    if (existingProviders === 0) {
      const providers = [];

      for (let i = 1; i <= 8; i++) {
        providers.push({
          name: `Provider ${i}`,
        });
      }

      await Provider.insertMany(providers);
    }

    for (const service of SERVICES) {
      const existingState = await AllocationState.findOne({
        serviceType: service,
      });

      if (!existingState) {
        await AllocationState.create({
          serviceType: service,
          currentIndex: 0,
        });
      }
    }

    return Response.json({
      success: true,
      message: "Seed completed",
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