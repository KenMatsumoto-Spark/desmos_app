import { Router } from 'express'
import controllers from './controllers'
import authentication from './middleware/authentication'

const app = Router()


app.use('/data', authentication, controllers.DataController)

export default app
