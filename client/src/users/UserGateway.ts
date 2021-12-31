import { failureServiceResponse, IServiceResponse, IUser, IUserProperty } from '../types'
import { endpoint, get, post, put } from '../global'

/** In development mode (locally) the server is at localhost:5000*/
const baseEndpoint = endpoint

/** This is the path to the users microservice */
const servicePath = 'user/'

/**
 * [FRONTEND USER GATEWAY]
 * UserGateway handles HTTP requests to the host, which is located on the server.
 * This UserGateway object uses the baseEndpoint, and additional server information
 * to access the requested information.
 *
 * These methods use the get, post, put and remove http requests from request.ts
 * helper methods to make requests to the server.
 */
export const UserGateway = {
  createUser: async (user: IUser): Promise<IServiceResponse<IUser>> => {
    try {
      return await post<IServiceResponse<IUser>>(baseEndpoint + servicePath + 'create', {
        user: user,
      })
    } catch (exception) {
      return failureServiceResponse('[createUser] Unable to access backend')
    }
  },

  /**
   * Gets user given an id
   *
   * @param userId userId of the node to delete
   * @returns Promise<IServiceResponse<{}>>
   */
  getUser: async (userId: string): Promise<IServiceResponse<IUser>> => {
    try {
      return await get<IServiceResponse<IUser>>(
        baseEndpoint + servicePath + 'getUserById/' + userId
      )
    } catch (exception) {
      return failureServiceResponse('[getUser] Unable to access backend')
    }
  },

  /**
   * Gets user given an email
   *
   * @param email email of the node to delete
   * @returns Promise<IServiceResponse<{}>>
   */
  getUserByEmail: async (email: string): Promise<IServiceResponse<IUser>> => {
    try {
      return await get<IServiceResponse<IUser>>(
        baseEndpoint + servicePath + 'getUserByEmail/' + email
      )
    } catch (exception) {
      return failureServiceResponse('[getUserByEmail] Unable to access backend')
    }
  },

  /**
   * This is method is that is called whenever a user is deleted
   *
   *
   * @param userId userId of the node to delete
   * @returns Promise<IServiceResponse<{}>>
   */
  deleteUser: async (userId: string): Promise<IServiceResponse<{}>> => {
    try {
      console.log('in da client gateway')
      // delete user
      return await post<IServiceResponse<IUser>>(baseEndpoint + servicePath + 'delete', {
        userId: userId,
      })
    } catch (exception) {
      return failureServiceResponse('[deleteUser] Unable to access backend')
    }
  },
  /**
   * Updates the user.
   *
   */
  updateUser: async (
    userId: string,
    properties: IUserProperty[]
  ): Promise<IServiceResponse<IUser>> => {
    console.log('updating in client gateway!')
    console.log(userId)
    console.log(JSON.stringify(properties))
    try {
      return await put<IServiceResponse<IUser>>(baseEndpoint + servicePath + userId, {
        data: properties,
      })
    } catch (exception) {
      return failureServiceResponse('[updateUser] Unable to access backend')
    }
  },
}
