import { IUser, makeIUser } from '../../../..'
import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { stringify } from 'querystring'
import { UserGateway } from '../../../../users'

describe('Unit Test: Delete User', () => {
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

  test('delete valid user', async () => {
    const validUser: IUser = makeIUser(
      'testid1',
      'avd@cs.brown.edu',
      'http://myurl.com/image',
      []
    )
    const response = await userGateway.createUser(validUser)
    expect(response.success).toBeTruthy()
    const deleteUser = await userGateway.deleteUser('testid1')
    expect(deleteUser.success).toBeTruthy()
  })

  test('successfully deletes user when user id does not exist', async () => {
    const validUser: IUser = makeIUser(
      'testid1',
      'avd@cs.brown.edu',
      'http://myurl.com/image',
      []
    )
    const response = await userGateway.createUser(validUser)
    expect(response.success).toBeTruthy()
    const deleteUser = await userGateway.deleteUser('testid2')
    expect(deleteUser.success).toBeTruthy()
  })

})
