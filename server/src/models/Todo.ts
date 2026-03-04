import { Schema, model, Document } from "mongoose";

export interface ITodo extends Document {
  title: string;
  description?: string;
  done: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const todoSchema = new Schema<ITodo>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 255,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    done: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Todo = model<ITodo>("Todo", todoSchema);
