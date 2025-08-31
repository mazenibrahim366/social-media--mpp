import { Router } from 'express'
import { validation } from '../../middleware/validation.middleware'
import userService from './user.service'
import * as validators from './user.validation'
import { authentication, authorization } from '../../middleware/authentication.middleware'
import { endPoint } from './authorization.user'
import { tokenTypeEnum } from '../../utils/enums'


const router = Router()

router.get('/' ,authentication() , authorization(endPoint.profile), userService.profile)
router.post('/logout' ,authentication() ,validation(validators.logout), userService.logout)
router.post("/refreshToken",authentication({tokenType:tokenTypeEnum.refresh}),userService.refreshToken)


export default router
