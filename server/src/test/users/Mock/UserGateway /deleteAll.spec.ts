import { IUser, makeIUser } from '../../../..'
import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { stringify } from 'querystring'
import { UserGateway } from '../../../../users'

describe('Unit Test: Delete All Users', () => {
  let uri: string
  let mongoClient: MongoClient
  let userGateway: UserGateway
  let mongoMemoryServer: MongoMemoryServer

  beforeAll(async () => {
    mongoMemoryServer = await MongoMemoryServer.create()
    uri = mongoMemoryServer.getUri()
    mongoClient = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    userGateway = new UserGateway(mongoClient)
    mongoClient.connect()
  })
  beforeEach(async () => {
    const response = await userGateway.deleteAll()
    expect(response.success).toBeTruthy()
  })
  afterAll(async () => {
    await mongoClient.close()
    await mongoMemoryServer.stop()
  })

  test('inserts valid user', async () => {
    const user1: IUser = makeIUser(
      'testid1',
      'avd@cs.brown.edu',
      'http://myurl.com/image',
      []
    )
    const response1 = await userGateway.createUser(user1)
    expect(response1.success).toBeTruthy()

    const user2: IUser = makeIUser(
      'testid2',
      'nkm@cs.brown.edu',
      'http://myurl.com/image2',
      []
    )
    const response2 = await userGateway.createUser(user2)
    expect(response2.success).toBeTruthy()

    const user3: IUser = makeIUser(
      'testid3',
      'lgelfond@cs.brown.edu',
      'http://myurl.com/image3',
      []
    )
    const response3 = await userGateway.createUser(user3)
    expect(response3.success).toBeTruthy()
    const deleteAllResp = await userGateway.deleteAll()
    expect(deleteAllResp.success).toBeTruthy()
    const findUser1Resp = await userGateway.getUserById('testid1')
    expect(findUser1Resp.success).toBeFalsy()
    const findUser2Resp = await userGateway.getUserById('testid2')
    expect(findUser2Resp.success).toBeFalsy()
    const findUser3Resp = await userGateway.getUserById('testid3')
    expect(findUser3Resp.success).toBeFalsy()
  })
})
