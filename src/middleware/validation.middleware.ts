import type { NextFunction, Request, Response } from 'express'
import { Types } from 'mongoose'
import z, { ZodType } from 'zod'
import { genderEnum, logoutEnum } from '../utils/enums'
export const generalFields = {
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    // .transform((value) => value.trim().split(/\s+/).join(' '))
    .refine(
      (value) => {
        const parts = value.split(' ')
        return parts.length === 2
      },
      {
        message: 'Full name must consist of exactly two words',
      }
    ),
  email: z.email('Invalid email address'),
  password: z
    .string()
    .regex(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/,
      'Password must contain at least 8 characters, one uppercase, one lowercase, and one number ,pattern :: /^(?=.*d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/'
    ),
  confirmPassword: z.string(),
  phone: z
    .string()
    .regex(
      /^(002|\+2)?01[0125][0-9]{8}$/,
      'Invalid Egyptian phone number ,pattern :: /^(002|+2)?01[0125][0-9]{8}$/'
    ),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
  id: z.string().refine((value) => Types.ObjectId.isValid(value), {
    message: 'Invalid MongoDB ID',
  }),
  gender: z.enum(Object.values(genderEnum) as [string, ...string[]]),
  flag: z.enum(Object.values(logoutEnum) as [string, ...string[]]),
  file: z.object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.string(),
    destination: z.string(),
    filename: z.string(),
    path: z.string(),
    size: z.number().positive(),
  }),
}

type KeyReqType = keyof Request
type SchemaTypes = Partial<Record<KeyReqType, ZodType>>
export const validation = (schema: SchemaTypes) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): NextFunction | Response => {
    let error: Array<{
      key: KeyReqType
      issues: { path: string | number | symbol | undefined; message: string }[]
    }> = []
    for (const key of Object.keys(schema) as KeyReqType[]) {
      if (!schema[key]) {
        continue
      }
      const validationResult = schema[key].safeParse(req[key])
      if (!validationResult.success) {
        error.push({
          key,
          issues: validationResult.error.issues.map((issue) => {
            return { path: issue.path[0], message: issue.message }
          }),
        })
      }
    }
    if (error.length) {
      return res.status(400).json({ message: 'validation error ', error })
    }
    return next() as unknown as NextFunction
  }
}
