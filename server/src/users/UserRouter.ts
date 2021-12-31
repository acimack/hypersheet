import express, { Request, Response, Router } from 'express'
import { MongoClient } from 'mongodb'
import { IServiceResponse } from '../types'
import { UserGateway } from './UserGateway'
import { isIUser, IUser } from '..'
import { IUserProperty } from '../types/IUserProperty'
const bodyJsonParser = require('body-parser').json()

// eslint-disable-next-line new-cap
export const UserExpressRouter = express.Router()

/**
 * UserRouter uses UserExpressRouter (an express router) to define responses
 * for specific HTTP requests at routes starting with '/user'.
 * E.g. a post request to '/user/create' would create a user.
 * The UserRouter contains a UserGateway so that when an HTTP request
 * is received, the UserRouter can call specific methods on UserGateway
 * to trigger the appropriate response. See server/src/app.ts to see how
 * we set up UserRouter.
 */
export class UserRouter {
  userGateway: UserGateway
  constructor(mongoClient: MongoClient) {
    this.userGateway = new UserGateway(mongoClient)
    /**
     * Request to create user
     * @param req request object coming from client
     * @param res response object to sent to client
     */
    UserExpressRouter.post('/create', async (req: Request, res: Response) => {
      try {
        const user = req.body.user
        // console.log('in UserRouter' + JSON.stringify(user))
        if (!isIUser(user)) {
          // console.log('not i User')
          res.status(400).send('not IUser!')
        } else {
          const response = await this.userGateway.createUser(user)
          console.log('user creatin in UserRouter : ' + JSON.stringify(response))
          res.status(200).send(response)
        }
      } catch (e) {
        res.status(500).send(e.message)
      }
    })

    /**
     * Request to retrieve user by userId
     * @param req request object coming from client
     * @param res response object to send to client
     */
    UserExpressRouter.get('/getUserById/:userId', async (req: Request, res: Response) => {
      try {
        const userId = req.params.userId
        const response: IServiceResponse<IUser> = await this.userGateway.getUserById(
          userId
        )
        res.status(200).send(response)
      } catch (e) {
        res.status(500).send(e.message)
      }
    })

    /**
     * Request to retrieve user by email
     * @param req request object coming from client
     * @param res response object to send to client
     */
    UserExpressRouter.get(
      '/getUserByEmail/:email',
      async (req: Request, res: Response) => {
        try {
          const email = req.params.email
          const response: IServiceResponse<IUser> = await this.userGateway.getUserByEmail(
            email
          )
          res.status(200).send(response)
        } catch (e) {
          res.status(500).send(e.message)
        }
      }
    )

    /**
     * Request to delete the user with the given userId
     * @param req request object coming from the client
     * @param res response object to send to client
     */
    UserExpressRouter.post('/delete', async (req: Request, res: Response) => {
      try {
        const userId = req.params.userId
        const response = await this.userGateway.deleteUser(userId)
        res.status(200).send(response)
      } catch (e) {
        res.status(500).send(e.message)
      }
    })

    /**
     * Request to update the user with the given userId and properties
     * @param req request object coming from the client
     * @param res response object to send to client
     */
    UserExpressRouter.put(
      '/:userId',
      bodyJsonParser,
      async (req: Request, res: Response) => {
        try {
          const userId = req.params.userId
          const toUpdate: IUserProperty[] = req.body.data
          const response = await this.userGateway.updateUser(userId, toUpdate)
          console.log(JSON.stringify(response))
          res.status(200).send(response)
        } catch (e) {
          res.status(500).send(e.message)
        }
      }
    )
  }
  /**
   * @returns UserRouter class
   */
  getExpressRouter = (): Router => {
    return UserExpressRouter
  }
}
