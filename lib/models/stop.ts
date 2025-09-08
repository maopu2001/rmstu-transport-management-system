import mongoose from "mongoose"

export interface IStop extends mongoose.Document {
  name: string
  location: {
    type: "Point"
    coordinates: [number, number] // [longitude, latitude]
  }
  description?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const StopSchema = new mongoose.Schema<IStop>(
  {
    name: {
      type: String,
      required: [true, "Stop name is required"],
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (v: number[]) => v.length === 2,
          message: "Coordinates must contain exactly 2 numbers [longitude, latitude]",
        },
      },
    },
    description: {
      type: String,
      trim: true,
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

// Create geospatial index for location queries
StopSchema.index({ location: "2dsphere" })

export default mongoose.models.Stop || mongoose.model<IStop>("Stop", StopSchema)
