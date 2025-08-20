
import { NextFunction, Request, Response } from "express"
import { decodedToken, IDecoded, tokenTypeEnum} from "../utils/security/token.security.js"
import { IUser } from "../DB/models/models.dto.js"
  declare  global{
  namespace Express {
    interface Request {
      decoded?: IDecoded
      user?: IUser
    }
  }
}


export const authentication = ({ tokenType = tokenTypeEnum.access } = {}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
	const authorization = req.headers.authorization;
	if (!authorization) {
	  return next(new Error("Authorization header missing"));
	}
	const result = await decodedToken({ authorization, next, tokenType });
	if (!result) {
	  return next(new Error("Invalid token"));
	}
	const { user, decoded } = result as { user: IUser; decoded: IDecoded };
	req.decoded = decoded;
	req.user = user;
	return next();
  };
}


// export const authorization =(accessRoles=[] ) => {
// return asyncHandler(async(req ,res,next)=>{
// if (!accessRoles.includes(req.user.role)) {
//        return next(new Error("Not authorized account",{cause:403}))
// }

//    return next()
// })
// }
