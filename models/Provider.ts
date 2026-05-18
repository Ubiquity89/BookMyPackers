import mongoose from "mongoose";

const ProviderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    monthlyQuota: {
      type: Number,
      default: 10,
    },

    leadsAssigned: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Provider ||
  mongoose.model("Provider", ProviderSchema);