import mongoose from "mongoose"

export interface IRoute extends mongoose.Document {
  name: string
  stops: Array<{
    stop: mongoose.Types.ObjectId
    order: number
  }>
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const RouteSchema = new mongoose.Schema<IRoute>(
  {
    name: {
      type: String,
      required: [true, "Route name is required"],
      trim: true,
    },
    stops: [
      {
        stop: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Stop",
          required: true,
        },
        order: {
          type: Number,
          required: true,
          min: 1,
        },
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

export default mongoose.models.Route || mongoose.model<IRoute>("Route", RouteSchema)
