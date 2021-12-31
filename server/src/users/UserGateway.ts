import { UserCollectionConnection } from './UserCollectionConnection'
import { MongoClient } from 'mongodb'
import {
  TreeWrapper,
  failureServiceResponse,
  IServiceResponse,
  successfulServiceResponse,
  isIUser,
  IUser,
  IUserProperty,
  isIUserProperty,
} from '../types'

/**
 * UserGateway handles requests from UserRouter and calls on methods
 * in UserCollectionConnection to interact with the database. It contains
 * the complex logic to check whether the request is valid, before
 * modifying the database.
 */
export class UserGateway {
  userCollectionConnection: UserCollectionConnection

  constructor(mongoClient: MongoClient, collectionName?: string) {
    this.userCollectionConnection = new UserCollectionConnection(
      mongoClient,
      collectionName ?? 'users'
    )
  }

  /**
   * Method to create a use and insert it into the database.
   *
   * @param userId - the userId of the user to be crewated
   */
  async createUser(user: IUser) {
    // console.log('inside UserGateway ' + JSON.stringify(user))
    if (!isIUser(user)) {
      return failureServiceResponse('Not a valid user.')
    }
    // check whether user is already in database
    const userResponse = await this.userCollectionConnection.findUserById(user.userId)
    if (userResponse.success) {
      return failureServiceResponse(
        'User with duplicate ID already exists in the database.'
      )
    }
    // if everything checks out, insert into database
    const createResponse = await this.userCollectionConnection.createUser(user)
    return createResponse
  }

  /**
   * Method to retrieve user with a given userId.
   *
   * @param userId - the userId of the user to be retrieved.
   * @returns IServiceResponse<IUser>
   */
  async getUserById(userId: string): Promise<IServiceResponse<IUser>> {
    return this.userCollectionConnection.findUserById(userId)
  }

  /**
   * Method to retrieve user with a given email.
   *
   * @param email - the email of the user to be retrieved.
   * @returns IServiceResponse<IUser>
   */
  async getUserByEmail(email: string): Promise<IServiceResponse<IUser>> {
    return this.userCollectionConnection.findUserByEmail(email)
  }

  /**
   * Method to delete user with the given userId.
   * @param userId the userId of the user
   * @returns Promise<IServiceREsponse<{}>>
   */
  async deleteUser(userId: string): Promise<IServiceResponse<{}>> {
    return this.userCollectionConnection.deleteUser(userId)
  }
  /**
   * Method to delete all users in the database.
   *
   * @returns IServiceResponse<{}>
   */
  async deleteAll(): Promise<IServiceResponse<{}>> {
    return await this.userCollectionConnection.clearUserCollection()
  }

  /**
   * Method to update a user with the given userId.
   * @param userId the userId of the user
   * @param toUpdate an array of IUserProperty
   *
   * @returns IServiceResponse<INode>
   */
  async updateUser(
    userId: string,
    toUpdate: IUserProperty[]
  ): Promise<IServiceResponse<IUser>> {
    const properties: any = {}
    for (let i = 0; i < toUpdate.length; i++) {
      if (!isIUserProperty(toUpdate[i])) {
        return failureServiceResponse('toUpdate parameters invalid')
      }
      const fieldName = toUpdate[i].fieldName
      const value = toUpdate[i].value
      properties[fieldName] = value
    }
    const userResponse = await this.userCollectionConnection.updateUser(
      userId,
      properties
    )
    if (!userResponse.success) {
      return failureServiceResponse('Could not updateUser in UserGateway')
    }
    return userResponse
  }
}
