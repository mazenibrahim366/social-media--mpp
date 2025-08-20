import type { Request, Response } from 'express'
import { AppError, BadError } from '../../utils/response/error.response'

import { customAlphabet } from 'nanoid'
import { create, findOne, updateOne } from '../../DB/db.service'
import UserModels from '../../DB/models/User.model'
import { encryptEncryption } from '../../utils/security/encryption.security'
import { compareHash, generateHash } from '../../utils/security/hash.security'

import { IUser } from '../../DB/models/models.dto'
import { newConfirmOtp } from '../../utils/Email/newConfirmOtp.email'
import { providerEnum } from '../../utils/enums'
import { emailEvent } from '../../utils/Events/email.events'
import { successResponse } from '../../utils/response/success.response'
import { generateLoginToken } from '../../utils/security/token.security'

class AuthenticationService {
  constructor() {}
  signup = async (req: Request, res: Response) => {
    let dateExpired = new Date(Date.now() + 2 * 60 * 1000)
    const { fullName, email, password, phone } = req.body

    const encPhone = await encryptEncryption({ message: phone })
    const user: IUser | null = await findOne({
      model: UserModels,
      filter: { email },
    })

    if (user) {
      throw new AppError('Email exist', 409)
    }
    const otp = customAlphabet('0123456789', 6)()

    const hashOto = await generateHash({ plainText: otp })
    const hashPassword = await generateHash({ plainText: password })

    emailEvent.emit('sendConfirmEmail', [email, 'Confirm-Email', otp])
    // await  sendEmail({to:email ,subject:"Confirm-Email" ,html:await emailTemplate(otp), res ,next})
    const [signupUser]: any = await create({
      model: UserModels,
      data: [
        {
          fullName,
          email,
          password: hashPassword,
          phone: encPhone,
          confirmEmailOtp: hashOto,
          otpExpired: dateExpired,
          otpAttempts: { bannedUntil: null, count: 0 },
        },
      ],
    })

    return successResponse({
      res,
      status: 201,
      data: process.env.MOOD === 'development' ? { signupUser } : {},
    })
  }

  login = async (req: Request, res: Response): Promise<Response> => {
    const { email, password } = req.body
    const user = await findOne({
      model: UserModels,
      filter: { email, provider: providerEnum.system },
    })
    if (!user) {
      throw new AppError(
        'In-valid login data or provider or email not confirmed',
        404
      )
    }
    if (!user.confirmEmail) {
      throw new BadError('please verify your access first ')
    }
    if (user.deletedAt) {
      throw new BadError('this account is deleted')
    }
    if (
      !(await compareHash({ plainText: password, hashValue: user.password }))
    ) {
      throw new AppError('In-valid login data', 404)
    }
    const data = await generateLoginToken(user)
    return successResponse({ res, status: 200, data })
  }
  confirmEmail = async (req: Request, res: Response): Promise<Response> => {
    const { email, otp } = req.body
    const user: IUser | null = await findOne({
      model: UserModels,
      filter: {
        email,
        provider: providerEnum.system,
        confirmEmail: { $exists: false },
        confirmEmailOtp: { $exists: true },
      },
    })
    if (!user) {
      throw new AppError('In-valid account', 404)
    }
    if (user.otpExpired && user.otpExpired < new Date()) {
      throw new BadError(`OTP Expired `)
    }
    if (
      user.otpAttempts.bannedUntil &&
      user.otpAttempts.bannedUntil > new Date()
    ) {
      throw new BadError(
        `You are temporarily banned until ${user.otpAttempts.bannedUntil.toLocaleTimeString()}`
      )
    }

    if (
      !(await compareHash({ plainText: otp, hashValue: user.confirmEmailOtp }))
    ) {
      throw new BadError('In-valid OTP')
    }

    await updateOne({
      model: UserModels,
      filter: { email },
      data: {
        $set: { confirmEmail: Date.now() },
        $unset: { confirmEmailOtp: 1, otpExpired: 1, otpAttempts: 1 },
      },
    })

    return successResponse({ res })
  }
  newConfirmEmail = async (
    req: Request,
    res: Response
  ): Promise<Response | void> => {
    const { email } = req.body

    await newConfirmOtp({ email, subject: 'Confirm-Email', res })
  }
}

export default new AuthenticationService()
