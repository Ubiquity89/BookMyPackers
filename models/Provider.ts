import mongoose from "mongoose";

const ProviderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // Safeguard to prevent identical provider document generation
    },

    monthlyQuota: {
      type: Number,
      default: 10,
      required: true,
    },

    leadsAssigned: {
      type: Number,
      default: 0,
      required: true,
      // CRITICAL GUARDRAIL: Prevents values from exceeding quota limits
      validate: {
        validator: function (this: any, val: number) {
          return val <= (this.monthlyQuota || 10);
        },
        message: "Allocation failure: Provider has completely filled their quota capacity.",
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Provider || mongoose.model("Provider", ProviderSchema);