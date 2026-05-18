import mongoose from "mongoose";

const WebhookEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      unique: true,
    },

    processed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.WebhookEvent ||
  mongoose.model("WebhookEvent", WebhookEventSchema);