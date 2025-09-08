import mongoose from "mongoose"

export interface IVehicle extends mongoose.Document {
  registrationNumber: string
  type: "BUS" | "MINIBUS"
  capacity: number
  driver?: mongoose.Types.ObjectId
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const VehicleSchema = new mongoose.Schema<IVehicle>(
  {
    registrationNumber: {
      type: String,
      required: [true, "Registration number is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["BUS", "MINIBUS"],
      required: [true, "Vehicle type is required"],
    },
    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
      min: [1, "Capacity must be at least 1"],
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Vehicle || mongoose.model<IVehicle>("Vehicle", VehicleSchema)
