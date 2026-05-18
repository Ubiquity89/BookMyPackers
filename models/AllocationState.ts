import mongoose from "mongoose";

const AllocationStateSchema = new mongoose.Schema({
  serviceType: {
    type: String,
    unique: true,
  },

  currentIndex: {
    type: Number,
    default: 0,
  },
});

export default mongoose.models.AllocationState ||
  mongoose.model("AllocationState", AllocationStateSchema);