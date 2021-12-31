import { IUser, makeIUser } from '../../../..'
import { UserCollectionConnection } from '../../../../users/UserCollectionConnection'
import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { stringify } from 'querystring'

describe('Unit Test: findUserByEmail', () => {
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

  test('gets user when given a valid email', async () => {
    const user1: IUser = makeIUser(
      'testid1',
      'avd@cs.brown.edu',
      'http://myurl.com/image',
      []
    )
    const response1 = await userCollectionConnection.createUser(user1)
    expect(response1.success).toBeTruthy()
    const findResp = await userCollectionConnection.findUserByEmail('avd@cs.brown.edu')
    expect(findResp.success).toBeTruthy()
  })

  test('fails to get user if given invalid email', async () => {
    const user1: IUser = makeIUser(
      'testid1',
      'avd@cs.brown.edu',
      'http://myurl.com/image',
      []
    )
    const response1 = await userCollectionConnection.createUser(user1)
    expect(response1.success).toBeTruthy()
    const findResp = await userCollectionConnection.findUserByEmail('nkm@cs.brown.edu')
    expect(findResp.success).toBeFalsy()
  })
})
