import mongoose from "mongoose"
import type { Document } from "mongoose"
import { genderEnum, providerEnum, roleEnum } from "../../utils/enums"




export interface IUser extends Document {
  firstName: string
  lastName: string
  email: string
  password?: string
  provider: providerEnum
  phone?: string
  confirmEmailOtp?: string
  otpExpired?: Date
  otpAttempts: {
    count: number
    bannedUntil?: Date |null
  }
  picture?: {
    public_id?: string
    secure_url?: string
  }
  pictureCover?: {
    public_id?: string
    secure_url?: string
  }[]
  gender: genderEnum
  role: roleEnum
  confirmEmail?: Date
  deletedAt?: Date
  freezeBy?: mongoose.Types.ObjectId
  restoreBy?: mongoose.Types.ObjectId
  oldPassword: string[]
  updatePassword?: Date
  changeCredentialsTime?: Date
  confirmPasswordOtp?: string
  fullName: string
}




export interface IToken extends Document {
  jti: string
  expiresIn: number
  userId?: mongoose.Types.ObjectId

}
