import type { Request, Response } from 'express'
import UserModels from '../../DB/models/User.model'
import { UserRepository } from '../../DB/repository/user.repository'
// import { AppError, BadError } from '../../utils/response/error.response'
import TokenModels from '../../DB/models/Token.model'
import { TokenRepository } from '../../DB/repository/token.repository'
import { logoutEnum } from '../../utils/enums'
import { successResponse } from '../../utils/response/success.response'
import { decryptEncryption } from '../../utils/security/encryption.security'
import { createRevokeToken, generateLoginToken } from '../../utils/security/token.security'
import { IUser } from '../../DB/models/models.dto'

class UserService {
  private UserModel = new UserRepository(UserModels)
  private TokenModel = new TokenRepository(TokenModels)

  constructor() {}
  profile = async (req: Request, res: Response) => {
const user = await this.UserModel.findById({id:req.user?._id  as string ,select:' -phone'})
    

  const decryptedPhone = await decryptEncryption({
    cipherText: req.user?.phone as string,
  });
  user!.phone = decryptedPhone
    return successResponse({
      res,
      status: 201,
      data:  { user  } ,
    })
  }
  logout = async (req: Request, res: Response) => {

   const { flag } = req.body
  let status = 200
  switch (flag) {
    case logoutEnum.signoutFromAllDevice:
      await this.UserModel.updateOne({

        filter: { _id: req.decoded?._id },
        data: { changeCredentialsTime: new Date() },
      })
      break

    default:
      await createRevokeToken({ req })
      status = 201
      break
  }
  console.log(this.TokenModel);
  // console.log(req.decoded);

  return successResponse({ res, status })
  }

  refreshToken = async (req: Request, res: Response) => {

     const data = await generateLoginToken(req.user as IUser)
await createRevokeToken({req})
  return successResponse({ res, status: 200, data })
  }

}

export default new UserService()
