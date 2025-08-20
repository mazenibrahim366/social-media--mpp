import { Router } from 'express'
import { validation } from '../../middleware/validation.middleware'
import authService from './auth.service'
import * as validators from './auth.validation'


const router = Router()

router.post('/signup' , validation(validators.signup), authService.signup)
router.post('/login',validation(validators.login), authService.login)
router.patch(
  '/confirmEmail',
  validation(validators.confirmEmail),
  authService.confirmEmail
)
router.patch(
  '/newConfirmEmail',
  validation(validators.newConfirmEmail),
  authService.newConfirmEmail
)

export default router
