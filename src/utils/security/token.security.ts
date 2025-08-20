import { NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { nanoid } from 'nanoid'
import { findById } from '../../DB/db.service.js'
import { IUser } from '../../DB/models/models.dto.js'
import UserModels from '../../DB/models/User.model.js'
import { roleEnum } from '../enums.js'
import { BadError } from '../response/error.response.js'

export const generateToken = async ({
  payload = '',
  signature = process.env.ACCESS_TOKEN_USER_SIGNATURE,
  option = { expiresIn: Number(process.env.ACCESS_EXPIRES) },
} = {}) => {
  return jwt.sign(payload, signature as string, option)
}
export const verifyToken = async ({
  token = '',
  signature = process.env.ACCESS_TOKEN_USER_SIGNATURE,
} = {}) => {
  return jwt.verify(token, signature as string)
}
export const getSignature = async ({
  signatureLevel = signatureTypeEnum.Bearer,
}: { signatureLevel?: SignatureType } = {}) => {
  const signature: {
    accessSignature?: string
    refreshSignature?: string
  } = {}

  switch (signatureLevel) {
    case signatureTypeEnum.System:
      signature.accessSignature = process.env.ACCESS_TOKEN_SYSTEM_SIGNATURE as string
      signature.refreshSignature = process.env.REFRESH_TOKEN_SYSTEM_SIGNATURE as string
      break

    default:
      signature.accessSignature = process.env.ACCESS_TOKEN_USER_SIGNATURE as string
      signature.refreshSignature = process.env.REFRESH_TOKEN_USER_SIGNATURE as string
      break
  }

  return signature
}

// Remove duplicate interface
export interface IDecoded extends jwt.JwtPayload {
  _id?: string
}

export const tokenTypeEnum = {
  access: 'access',
  refresh: 'refresh',
} as const

export const signatureTypeEnum = {
  Bearer: 'Bearer',
  System: 'System',
} as const

type TokenType = keyof typeof tokenTypeEnum
type SignatureType = keyof typeof signatureTypeEnum

export const decodedToken = async ({
  authorization = '',
  next,
  tokenType = tokenTypeEnum.access,
}: {
  authorization?: string
  next: NextFunction
  tokenType?: TokenType
}) => {
  const [bearer, token] = authorization?.split(' ') || []

  if (!token || !bearer) {
    throw new BadError('missing token parts')
  }

  if (!Object.values(signatureTypeEnum).includes(bearer as any)) {
    throw new BadError('Invalid bearer type')
  }

  const signature = await getSignature({
    signatureLevel: bearer as SignatureType,
  })

  const decoded = (await verifyToken({
    token,
    signature:
      tokenType === 'access'
        ? signature.accessSignature
        : signature.refreshSignature,
  })) as IDecoded

  if (!decoded?._id) {
    return next(new Error('In-valid token'))
  }

  const user: any = await findById({ model: UserModels, id: decoded._id })
  if (!user) {
    throw new BadError('Not register account')
  }

  if (
    !user.freezeBy &&
    user?.changeCredentialsTime?.getTime() > (decoded.iat ?? 0) * 1000
  ) {
    throw new BadError('In-valid login credentials ')
  }

  return { user, decoded }
}

export async function generateLoginToken(user: IUser)  {
  const signature = await getSignature({
    signatureLevel:
      user.role != roleEnum.User
        ? signatureTypeEnum.System
        : signatureTypeEnum.Bearer,
  })
  const jwtid = nanoid()
  const access_token = await generateToken({
    payload: { _id: user?._id } as { _id: string } as any,
    signature: signature.accessSignature,
    option: { expiresIn: Number(process.env.ACCESS_EXPIRES), jwtid }as {expiresIn: number; jwtid: string},
  })
  const refresh_token = await generateToken({
    payload: { _id: user?._id }as any,
    signature: signature.refreshSignature,
    option: { expiresIn: Number(process.env.REFRESH_EXPIRES), jwtid }as {expiresIn: number; jwtid: string},
  })
  return { access_token, refresh_token }
}

