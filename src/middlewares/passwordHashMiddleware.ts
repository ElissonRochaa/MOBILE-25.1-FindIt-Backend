import bcrypt from 'bcryptjs';
import { CallbackWithoutResultAndOptionalError } from 'mongoose';
import { IUser } from '../models/User';

export const hashPassword = async function (this: IUser, next: CallbackWithoutResultAndOptionalError) {
  if (!this.isModified('senha')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.senha = await bcrypt.hash(this.senha, salt);
    next();
  } catch (error: any) {
    next(error);
  }
};