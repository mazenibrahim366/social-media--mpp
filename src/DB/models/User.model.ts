import mongoose from 'mongoose'
import { genderEnum, providerEnum, roleEnum } from '../../utils/enums'
import { IUser } from './models.dto'

const userSchema = new mongoose.Schema<IUser>(
  {
    firstName: { type: String, required: true, minLength: 2, maxLength: 20 },
    lastName: { type: String, required: true, minLength: 2, maxLength: 20 },
    email: { type: String, unique: true, required: true, minLength: 2 },
    password: {
      type: String,
      required: function (this: IUser) {
        return this.provider === providerEnum.system ? true : false
      },
      minLength: 2,
    },
    provider: {
      type: String,
      enum: { values: Object.values(providerEnum) },
      default: providerEnum.system,
    },
    phone: { type: String },
    confirmEmailOtp: {
      type: String,
      required: function (this: IUser) {
        return this.provider === providerEnum.system ? true : false
      },
    },
    otpExpired: {
      type: Date,
      required: function (this: IUser) {
        return this.provider === providerEnum.system ? true : false
      },
    },
    otpAttempts: {
      count: { type: Number, default: 0 },
      bannedUntil: { type: Date },
    },
    picture: { public_id: String, secure_url: String },
    pictureCover: [{ public_id: String, secure_url: String }],
    gender: {
      type: String,
      enum: {
        values: Object.values(genderEnum),
        message: `gender only allow ${Object.values(genderEnum)} `,
      },
      default: genderEnum.male,
    },
    role: {
      type: String,
      enum: {
        values: Object.values(roleEnum),
        message: `role only allow ${Object.values(roleEnum)} `,
      },
      default: roleEnum.User,
    },
    confirmEmail: { type: Date },
    deletedAt: { type: Date },
    freezeBy: { type:mongoose.Schema.Types.ObjectId, ref: 'User' },
    restoreBy: { type:mongoose.Schema.Types.ObjectId, ref: 'User' },
    oldPassword: [String],
    updatePassword: { type: Date },
    changeCredentialsTime: { type: Date },
    confirmPasswordOtp: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

userSchema
  .virtual('fullName')
  .set(function (this: IUser, value: string) {
    const [firstName, lastName] = value?.split(' ')
    this.set({ firstName, lastName })
  })
  .get(function (this: IUser) {
    return this.firstName + ' ' + this.lastName
  })



const UserModels =  mongoose.models.User || mongoose.model<IUser>('User', userSchema)

UserModels.syncIndexes()

export default UserModels
