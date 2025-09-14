import mongoose from "mongoose";

export interface IStudent extends mongoose.Document {
  name: string;
  email: string;
  regId?: string;
}

const Student = new mongoose.Schema<IStudent>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    regId: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Student ||
  mongoose.model<IStudent>("Student", Student);
