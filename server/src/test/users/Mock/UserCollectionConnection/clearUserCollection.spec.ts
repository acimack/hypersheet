import { IUser, makeIUser } from '../../../..'
import { UserCollectionConnection } from '../../../../users/UserCollectionConnection'
import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { stringify } from 'querystring'

describe('Unit Test: clearUserCollection', () => {
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

  test('sucessfully deletes all users', async () => {
    const user1: IUser = makeIUser(
      'testid1',
      'avd@cs.brown.edu',
      'http://myurl.com/image',
      []
    )
    const response1 = await userCollectionConnection.createUser(user1)
    expect(response1.success).toBeTruthy()

    const user2: IUser = makeIUser(
      'testid2',
      'nkm@cs.brown.edu',
      'http://myurl.com/image2',
      []
    )
    const response2 = await userCollectionConnection.createUser(user2)
    expect(response2.success).toBeTruthy()

    const user3: IUser = makeIUser(
      'testid3',
      'lgelfond@cs.brown.edu',
      'http://myurl.com/image3',
      []
    )
    const response3 = await userCollectionConnection.createUser(user3)
    expect(response3.success).toBeTruthy()

    const deleteAllResp = await userCollectionConnection.clearUserCollection()
    expect(deleteAllResp.success).toBeTruthy()

    const findUser1Resp = await userCollectionConnection.findUserById('testid1')
    const findUser2Resp = await userCollectionConnection.findUserById('testid2')
    expect(findUser2Resp.success).toBeFalsy()
    const findUser3Resp = await userCollectionConnection.findUserById('testid3')
    expect(findUser3Resp.success).toBeFalsy()
  })
})
