import {
  IServiceResponse,
  failureServiceResponse,
  successfulServiceResponse,
  IUser,
  isIUser,
} from '../types'
import { MongoClient } from 'mongodb'

/**
 * UserCollectionConnection acts as an in-between communicator between
 * the MongoDB database and UserGateway. UserCollectionConnection
 * defines methods that interact directly with MongoDB. That said,
 * it does not include any of the complex logic that UserGateway has.
 * Note, currently, UserGateway is very simple. But as we add more complexity
 * to our system, we will implement that logic in UserGateway.
 *
 * @param {MongoClient} client
 * @param {string} collectionName
 */
export class UserCollectionConnection {
  client: MongoClient
  collectionName: string

  constructor(mongoClient: MongoClient, collectionName?: string) {
    this.client = mongoClient
    this.collectionName = collectionName ?? 'users'
  }
  /**
   * Creates a new user in the database.
   * Returns successfulServiceResponse with IUser that was inserted as the payload.
   * @param {IUser} user
   * @return successfulServiceResponse<IUser>
   */
  async createUser(user: IUser): Promise<IServiceResponse<IUser>> {
    const insertResponse = await this.client
      .db()
      .collection(this.collectionName)
      .insertOne(user)
    if (insertResponse.insertedCount) {
      return successfulServiceResponse(insertResponse.ops[0])
    }
    return failureServiceResponse(
      'Failed to insert user, userCount: ' + insertResponse.insertedCount
    )
  }

  /**
   * Updates a user when given a userId and a set of properties to update.
   * NOTE: couldn't users do we need to deal with security better here?
   * @param {string} userId
   * @param {Object} properties to update in MongoDB
   * @return successfulServiceResponse<INode> on success
   *         failureServiceResponse on failure
   */
  async updateUser(
    userId: string,
    updatedProperties: Object
  ): Promise<IServiceResponse<IUser>> {
    const updateResponse = await this.client
      .db()
      .collection(this.collectionName)
      .findOneAndUpdate(
        { userId: userId },
        { $set: updatedProperties },
        { returnOriginal: false }
      )
    if (updateResponse.ok && updateResponse.lastErrorObject.n) {
      return successfulServiceResponse(updateResponse.value)
    }
    return failureServiceResponse(
      'Failed to update node, lastErrorObject: ' +
        updateResponse.lastErrorObject.toString()
    )
  }

  /**
   * Deletes a user with the given userId
   *
   * @param {string} userId
   * @return successfulServiceResponse<IUser> on success
   *         failureServiceResponse on failure
   */
  async deleteUser(userId: string): Promise<IServiceResponse<{}>> {
    const deleteResponse = await this.client
      .db()
      .collection(this.collectionName)
      .deleteOne({ userId: userId })
    if (deleteResponse.result.ok) {
      return successfulServiceResponse({})
    } else {
      return failureServiceResponse('Failed to delete')
    }
  }

  /**
   * Finds user by Id.
   * @param {string} userId
   * @return successfulServiceResponse<IUser> on success
   *         failureServiceResponse on failure
   */
  async findUserById(userId: string): Promise<IServiceResponse<IUser>> {
    const findResponse = await this.client
      .db()
      .collection(this.collectionName)
      .findOne({ userId: userId })
    if (findResponse == null) {
      return failureServiceResponse('Failed to find user with this userId')
    } else {
      return successfulServiceResponse(findResponse)
    }
  }

  /**
   * Finds user by email.
   * @param {string} email
   * @return successfulServiceResponse<IUser> on success
   *         failureServiceResponse on failure
   */
  async findUserByEmail(email: string): Promise<IServiceResponse<IUser>> {
    const findResponse = await this.client
      .db()
      .collection(this.collectionName)
      .findOne({ email: email })
    if (findResponse == null) {
      return failureServiceResponse('Failed to find user with this email')
    } else {
      return successfulServiceResponse(findResponse)
    }
  }

  /**
   * Clears the entire user collection in the database.
   * @return successfulServiceResponse on suiccess
   *         failureServiceResponse on failure
   */
  async clearUserCollection(): Promise<IServiceResponse<{}>> {
    const response = await this.client.db().collection(this.collectionName).deleteMany({})
  if (response.result.ok) {
    return successfulServiceResponse({})
    }
    return failureServiceResponse('Failed to clear user collection.')
  }
}
