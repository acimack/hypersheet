import { IUser, makeIUser } from '../../../..'
import { UserCollectionConnection } from '../../../../users/UserCollectionConnection'
import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { stringify } from 'querystring'

describe('Unit Test: deleteUser', () => {
  let uri
  let mongoClient
  let userCollectionConnection
  let mongoMemoryServer

  beforeAll(async () => {
    mongoMemoryServer = await MongoMemoryServer.create()
    uri = mongoMemoryServer.getUri()
    mongoClient = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    userCollectionConnection = new UserCollectionConnection(mongoClient)
    mongoClient.connect()
  })
  beforeEach(async () => {
    const response = await userCollectionConnection.clearUserCollection()
    expect(response.success).toBeTruthy()
  })
  afterAll(async () => {
    await mongoClient.close()
    await mongoMemoryServer.stop()
  })

  test('sucessfully deletes user', async () => {
    const validUser: IUser = makeIUser(
      'testid',
      'avd@cs.brown.edu',
      'http://myurl.com/image',
      []
    )
    const createResponse = await userCollectionConnection.createUser(validUser)
    expect(createResponse.success).toBeTruthy()
    const deleteUserResp = await userCollectionConnection.deleteUser('testid')
    expect(deleteUserResp.success).toBeTruthy()
  })

  test('gives success if we try to delete user that ' + ' does not exist ', async () => {
    const validUser: IUser = makeIUser(
      'testid',
      'avd@cs.brown.edu',
      'http://myurl.com/image',
      []
    )
    const createResponse = await userCollectionConnection.createUser(validUser)
    expect(createResponse.success).toBeTruthy()
    const deleteUserResp = await userCollectionConnection.deleteUser('difftestid')
    expect(deleteUserResp.success).toBeTruthy()
  })
})
