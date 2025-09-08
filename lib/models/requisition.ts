import mongoose from "mongoose"

export interface IRequisition extends mongoose.Document {
  user: mongoose.Types.ObjectId
  name: string
  department: string
  purpose: string
  requestedDate: Date
  requestedTime: string
  numberOfPassengers: number
  status: "PENDING" | "APPROVED" | "DENIED"
  adminNotes?: string
  createdAt: Date
  updatedAt: Date
}

const RequisitionSchema = new mongoose.Schema<IRequisition>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    purpose: {
      type: String,
      required: [true, "Purpose is required"],
      trim: true,
    },
    requestedDate: {
      type: Date,
      required: [true, "Requested date is required"],
    },
    requestedTime: {
      type: String,
      required: [true, "Requested time is required"],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format. Use HH:MM"],
    },
    numberOfPassengers: {
      type: Number,
      required: [true, "Number of passengers is required"],
      min: [1, "Number of passengers must be at least 1"],
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "DENIED"],
      default: "PENDING",
    },
    adminNotes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Requisition || mongoose.model<IRequisition>("Requisition", RequisitionSchema)
