import { connectDB } from "@/lib/db";

import Provider from "@/models/Provider";
import WebhookEvent from "@/models/WebhookEvent";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const { eventId } = body;

    if (!eventId) {
      return Response.json(
        {
          success: false,
          message: "eventId required",
        },
        {
          status: 400,
        }
      );
    }

    const existingEvent =
      await WebhookEvent.findOne({
        eventId,
      });

    if (existingEvent) {
      return Response.json({
        success: true,
        message:
          "Webhook already processed",
      });
    }

    await WebhookEvent.create({
      eventId,
      processed: true,
    });

    await Provider.updateMany(
      {},
      {
        monthlyQuota: 10,
        leadsAssigned: 0,
      }
    );

    return Response.json({
      success: true,
      message: "Quota reset successful",
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