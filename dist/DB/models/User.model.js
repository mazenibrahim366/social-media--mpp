"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const enums_1 = require("../../utils/enums");
const userSchema = new mongoose_1.default.Schema({
    firstName: { type: String, required: true, minLength: 2, maxLength: 20 },
    lastName: { type: String, required: true, minLength: 2, maxLength: 20 },
    email: { type: String, unique: true, required: true, minLength: 2 },
    password: {
        type: String,
        required: function () {
            return this.provider === enums_1.providerEnum.system ? true : false;
        },
        minLength: 2,
    },
    provider: {
        type: String,
        enum: { values: Object.values(enums_1.providerEnum) },
        default: enums_1.providerEnum.system,
    },
    phone: { type: String },
    confirmEmailOtp: {
        type: String,
        required: function () {
            return this.provider === enums_1.providerEnum.system ? true : false;
        },
    },
    otpExpired: {
        type: Date,
        required: function () {
            return this.provider === enums_1.providerEnum.system ? true : false;
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
            values: Object.values(enums_1.genderEnum),
            message: `gender only allow ${Object.values(enums_1.genderEnum)} `,
        },
        default: enums_1.genderEnum.male,
    },
    role: {
        type: String,
        enum: {
            values: Object.values(enums_1.roleEnum),
            message: `role only allow ${Object.values(enums_1.roleEnum)} `,
        },
        default: enums_1.roleEnum.User,
    },
    confirmEmail: { type: Date },
    deletedAt: { type: Date },
    freezeBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
    restoreBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
    oldPassword: [String],
    updatePassword: { type: Date },
    changeCredentialsTime: { type: Date },
    confirmPasswordOtp: { type: String },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
userSchema
    .virtual('fullName')
    .set(function (value) {
    const [firstName, lastName] = value?.split(' ');
    this.set({ firstName, lastName });
})
    .get(function () {
    return this.firstName + ' ' + this.lastName;
});
const UserModels = mongoose_1.default.models.User || mongoose_1.default.model('User', userSchema);
UserModels.syncIndexes();
exports.default = UserModels;
