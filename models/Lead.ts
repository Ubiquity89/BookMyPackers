import mongoose from "mongoose";

const LeadSchema = new mongoose.Schema(
  {
    name: String,

    phone: {
      type: String,
      required: true,
    },

    city: String,

    serviceType: {
      type: String,
      required: true,
    },

    description: String,
  },
  {
    timestamps: true,
  }
);

LeadSchema.index(
  { phone: 1, serviceType: 1 },
  { unique: true }
);

export default mongoose.models.Lead ||
  mongoose.model("Lead", LeadSchema);