import bcrypt from 'bcryptjs';
import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';

const adminSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

export type AdminDoc = HydratedDocument<InferSchemaType<typeof adminSchema>>;

export const AdminModel = model('Admin', adminSchema);

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
