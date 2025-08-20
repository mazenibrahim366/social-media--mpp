import z from 'zod'
import { generalFields } from '../../middleware/validation.middleware'

export const signup = {
  body: z
    .strictObject({
      fullName: generalFields.fullName,
      email: generalFields.email,
      password: generalFields.password,
      confirmPassword: generalFields.confirmPassword,
      phone: generalFields.phone,
    })
    .refine((data) => data.password === data.confirmPassword, {
      
      message: "Passwords don't match",
      path: ['confirmPassword'],
    }),
}
export const login = {
  body: z
    .strictObject({
      email: generalFields.email,
      password: generalFields.password,
    })
}
export const confirmEmail = {
  body: z
    .strictObject({
      email: generalFields.email,
      otp: generalFields.otp,
    })
}
export const newConfirmEmail =  {
  body: z
    .strictObject({
      email: generalFields.email,
  
    })
}
