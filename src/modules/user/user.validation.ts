import z from 'zod'
import { logoutEnum } from '../../utils/enums'

export const logout = {
  body: z
    .strictObject({
      flag: z.enum(logoutEnum).default(logoutEnum.signout),

    })

}


