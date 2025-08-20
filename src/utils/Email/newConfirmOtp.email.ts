import { Response } from 'express'
import { customAlphabet } from 'nanoid'
import { findOne, updateOne } from '../../DB/db.service'
import { IUser } from '../../DB/models/models.dto'
import UserModels from '../../DB/models/User.model'
import { providerEnum } from '../enums'
import { emailEvent } from '../Events/email.events'
import { AppError, BadError } from '../response/error.response'
import { successResponse } from '../response/success.response'
import { generateHash } from '../security/hash.security'
import { log } from 'console'

export const newConfirmOtp = async ({
  email = '',
  subject = 'Confirm-Email',
  res,
}: {
  email: string
  subject?: string
  res: Response
}) => {
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
  if (user.otpExpired && user.otpExpired > new Date()) {
    throw new AppError(
      `wait is not expired , expireDate : ${user.otpExpired.toLocaleTimeString()}`,
      401
    )
  }
  if (
    user.otpAttempts.bannedUntil &&
    user.otpAttempts.bannedUntil > new Date()
  ) {
    throw new BadError(
      `You are temporarily banned until ${user.otpAttempts.bannedUntil.toLocaleTimeString()}`
    )
  }

  const otp = customAlphabet('0123456789', 6)()

  const hashOto = await generateHash({ plainText: otp })

  await updateOne({
    model: UserModels,
    filter: { email },
    data: {
      confirmEmailOtp: hashOto,
      otpExpired: new Date(Date.now() + 2 * 60 * 1000),
      otpAttempts: {
        count: user.otpAttempts.count + 1 >= 5 ? 0 : user.otpAttempts.count + 1,
        bannedUntil:
          user.otpAttempts.count + 1 >= 5
            ? new Date(new Date().getTime() + 5 * 60 * 1000)
            : null,
      },
    },
  })
  console.log(otp);
  
 emailEvent.emit('sendConfirmEmail', [email, subject, otp])

  return successResponse({ res })
}
export const newOtpPassword = async ({
  email = '',
  subject = 'Confirm-Password',
  res,
}: {
  email: string
  subject?: string
  res: Response
}) => {
  const user = await findOne({
    model: UserModels,
    filter: {
      email,
      provider: providerEnum.system,
      confirmEmail: { $exists: true },
      deletedAt: { $exists: false },
    },
  })
  if (!user) {
    throw new AppError('In-valid account', 404)
  }
  if (user.confirmEmailOtp) {
    throw new AppError(
      'In-valid login data or provider or email not confirmed',
      404
    )
  }
  if (user.otpExpired && user.otpExpired > new Date()) {
    throw new AppError(
      `wait is not expired , expireDate : ${user.otpExpired.toLocaleTimeString()}`,
      401
    )
  }
  if (
    user.otpAttempts.bannedUntil &&
    user.otpAttempts.bannedUntil > new Date()
  ) {
    throw new BadError(
      `You are temporarily banned until ${user.otpAttempts.bannedUntil.toLocaleTimeString()}`
    )
  }

  const otp = customAlphabet('0123456789', 6)()
log(otp);
  const hashOto = await generateHash({ plainText: otp })

  await updateOne({
    model: UserModels,
    filter: { email },
    data: {
      confirmPasswordOtp: hashOto,
      otpExpired: new Date(Date.now() + 2 * 60 * 1000),
      otpAttempts: {
        count: user.otpAttempts.count + 1 >= 5 ? 0 : user.otpAttempts.count + 1,
        bannedUntil:
          user.otpAttempts.count + 1 >= 5
            ? new Date(new Date().getTime() + 5 * 60 * 1000)
            : null,
      },
    },
  })

  emailEvent.emit('sendConfirmEmail', [email, 'Confirm-Password', otp])
  // console.log(otp);
  // console.log(hashOto);
  return successResponse({ res })
}

// export const newConfirmOtp = async ({email="" ,subject="Confirm-Email",next  ,res}:{email:string ,subject: string ,next:NextFunction  ,res :Response} ) => {
//   const   user = await findOne({ model:UserModels , filter:{email,provider: providerEnum.system,confirmEmail:{$exists:false},confirmEmailOtp:{$exists:true}, }})
//     if (!user) {
//         return next(new Error("In-valid account",{cause: 404}))
//     }
//           if (user.otpExpired as > new Date())  {
//     return    next(new Error(`wait is not expired , expireDate : ${user.otpExpired.toLocaleTimeString()}`,{cause: 401}))
//   }
//       if (user.otpAttempts.bannedUntil > new Date()) {
//     return next( new Error(`You are temporarily banned until ${user.otpAttempts.bannedUntil.toLocaleTimeString()}`))
//   }

//     const otp = customAlphabet("0123456789",6)()

//     const hashOto = await generateHash({plainText : otp })

// await updateOne({model:UserModels,filter:{email},data:{confirmEmailOtp :hashOto ,otpExpired:new Date(Date.now()+2 * 60 * 1000),otpAttempts:{ count:user.otpAttempts.count+ 1 >= 5?0:user.otpAttempts.count+1,bannedUntil:user.otpAttempts.count+ 1 >= 5?new Date( new Date().getTime() + 5 * 60 * 1000):null}}})

//   sendEmail({to:email ,subject:subject ,html:await emailTemplate(otp), res ,next})
//   // console.log(otp);
//   // console.log(hashOto);
//     return successResponse({res})

// }
// export const newOtpPassword = async ({email="" ,subject="Confirm-Password",next ,res}={} ) => {
//   const   user = await findOne({ model:UserModels , filter:{email,provider: providerEnum.system,confirmEmail:{$exists:true},deletedAt:{$exists:false} }})
//     if (!user) {
//         return next(new Error("In-valid account",{cause: 404}))
//     }
//     if (user.confirmEmailOtp) {
//         return next(new Error("In-valid login data or provider or email not confirmed",{cause: 404}))
//     }
//           if (user.otpExpired> new Date()) {
//     return    next(new Error(`wait is not expired , expireDate : ${user.otpExpired.toLocaleTimeString()}`,{cause: 401}))
//   }
//       if (user.otpAttempts.bannedUntil > new Date()) {
//     return next( new Error(`You are temporarily banned until ${user.otpAttempts.bannedUntil.toLocaleTimeString()}`))
//   }

//     const otp = customAlphabet("0123456789",6)()

//     const hashOto = await generateHash({plainText : otp })

// await updateOne({model:UserModels,filter:{email},data:{confirmPasswordOtp :hashOto ,otpExpired:new Date(Date.now()+2 * 60 * 1000),otpAttempts:{ count:user.otpAttempts.count+ 1 >= 5?0:user.otpAttempts.count+1,bannedUntil:user.otpAttempts.count+ 1 >= 5?new Date( new Date().getTime() + 5 * 60 * 1000):null}}})

//   sendEmail({to:email ,subject:subject ,html:await emailTemplate(otp), res ,next})
//   // console.log(otp);
//   // console.log(hashOto);
//     return successResponse({res})

// }
