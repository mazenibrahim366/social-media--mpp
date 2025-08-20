import  cors from 'cors'
import { config } from 'dotenv'
import type { Express, Request, Response } from 'express'
import  express from 'express'
import { rateLimit } from 'express-rate-limit'
import helmet from 'helmet'
import { resolve } from 'node:path'
import ConnectionDB from './DB/connection.db'
import authController from './modules/auth/auth.controller'
import { globalErrorHandling } from './utils/response/error.response'
config({ path: resolve('./config/.env.development') })


const bootstrap = async () => {
  const app: Express = express()
  const port: number | string = process.env.PORT || 5000

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    message: { error: 'too many request please try again later ' },
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
    // store: ... , // Redis, Memcached, etc. See below.
  })
  // helmet
  app.use(helmet())

  // cors
  app.use(cors())
  // Apply the rate limiting middleware to all requests.
  app.use(limiter)
  // DB connection
  await ConnectionDB()
  // app router

  app.use(express.json())
  app.get('/', (req: Request, res: Response) =>
    res.json({
      message: `welcome to ${process.env.APPLICATION_NAME} backend landing page `,
    })
  )
  //sup app router modules
  app.use('/auth', authController)
  app.use(globalErrorHandling)
  app.all('{/*dummy}', (req, res) =>
    res.status(404).json({ message: 'In-valid app router' })
  )
  app.listen(port, () => console.log(`Server is running on port => ${port}!`))
}
export default bootstrap
