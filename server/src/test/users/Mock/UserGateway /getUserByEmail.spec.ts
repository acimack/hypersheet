import { IUser, makeIUser } from '../../../..'
import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { stringify } from 'querystring'
import { UserGateway } from '../../../../users'

describe('Unit Test: Get User By Email', () => {
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

  test('gets user when given valid email', async () => {
    const validUser: IUser = makeIUser(
      'testid1',
      'avd@cs.brown.edu',
      'http://myurl.com/image',
      []
    )
    const response = await userGateway.createUser(validUser)
    expect(response.success).toBeTruthy()
    const getUserByIdResp = await userGateway.getUserByEmail('avd@cs.brown.edu')
    expect(getUserByIdResp.success).toBeTruthy()
  })
  test('fails to get a user when given invalid id', async () => {
    const validUser: IUser = makeIUser(
      'testid1',
      'avd@cs.brown.edu',
      'http://myurl.com/image',
      []
    )
    const response = await userGateway.createUser(validUser)
    expect(response.success).toBeTruthy()
    const getUserByIdResp = await userGateway.getUserByEmail('nkm@cs.brown.edu')
    expect(getUserByIdResp.success).toBeFalsy()
  })
})
