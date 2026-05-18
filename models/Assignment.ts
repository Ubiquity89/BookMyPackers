import mongoose from "mongoose";

const AssignmentSchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
    },

    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
    },
  },
  {
    timestamps: true,
  }
);

AssignmentSchema.index(
  { leadId: 1, providerId: 1 },
  { unique: true }
);

export default mongoose.models.Assignment ||
  mongoose.model("Assignment", AssignmentSchema);