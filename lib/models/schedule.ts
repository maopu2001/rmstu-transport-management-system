import mongoose from "mongoose"

export interface ISchedule extends mongoose.Document {
  route: mongoose.Types.ObjectId
  vehicle: mongoose.Types.ObjectId
  departureTime: string // Format: "HH:MM"
  daysOfWeek: number[] // 0-6 (Sunday-Saturday)
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const ScheduleSchema = new mongoose.Schema<ISchedule>(
  {
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: [true, "Route is required"],
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: [true, "Vehicle is required"],
    },
    departureTime: {
      type: String,
      required: [true, "Departure time is required"],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format. Use HH:MM"],
    },
    daysOfWeek: [
      {
        type: Number,
        min: 0,
        max: 6,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Schedule || mongoose.model<ISchedule>("Schedule", ScheduleSchema)
