
import { NextFunction, Request, Response } from 'express'

const adminToken = process.env.ADMIN_TOKEN

const authentication = async function (request: Request, response: Response, next: NextFunction) {
  try {
    const authHeader = request.headers.authorization

    if(authHeader){
      const [header, token] = authHeader?.split(' ')
      
      if (String(header).toLowerCase() === 'bearer' && token === adminToken) request.body.authorized = true;
    }
  
    next()
  } catch (error) {
    console.log({ error})
    next()
  }
}

export default authentication
