import mongoose from "mongoose"

export interface ITrip extends mongoose.Document {
  schedule: mongoose.Types.ObjectId
  date: Date
  status: "PENDING" | "ONGOING" | "COMPLETED" | "CANCELLED"
  liveLocation?: {
    type: "Point"
    coordinates: [number, number]
  }
  driverStatus?: string
  startTime?: Date
  endTime?: Date
  createdAt: Date
  updatedAt: Date
}

const TripSchema = new mongoose.Schema<ITrip>(
  {
    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Schedule",
      required: [true, "Schedule is required"],
    },
    date: {
      type: Date,
      required: [true, "Trip date is required"],
    },
    status: {
      type: String,
      enum: ["PENDING", "ONGOING", "COMPLETED", "CANCELLED"],
      default: "PENDING",
    },
    liveLocation: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
        validate: {
          validator: (v: number[]) => v.length === 2,
          message: "Coordinates must contain exactly 2 numbers [longitude, latitude]",
        },
      },
    },
    driverStatus: {
      type: String,
      trim: true,
    },
    startTime: Date,
    endTime: Date,
  },
  {
    timestamps: true,
  },
)

// Create geospatial index for location queries
TripSchema.index({ liveLocation: "2dsphere" })

export default mongoose.models.Trip || mongoose.model<ITrip>("Trip", TripSchema)
