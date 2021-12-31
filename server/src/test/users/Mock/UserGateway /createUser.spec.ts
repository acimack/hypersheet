import { IUser, makeIUser } from '../../../..'
import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { stringify } from 'querystring'
import { UserGateway } from '../../../../users'

describe('Unit Test: Create User', () => {
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
    const validUser: IUser = makeIUser(
      'testid1',
      'avd@cs.brown.edu',
      'http://myurl.com/image',
      []
    )
    const response = await userGateway.createUser(validUser)
    expect(response.success).toBeTruthy()
    expect(response.payload).toStrictEqual(validUser)
  })
    test('fails to create user with duplicate id', async () => {
    const validUser: IUser = makeIUser(
      'testid1',
      'avd@cs.brown.edu',
      'http://myurl.com/image',
      []
    )
    
    const validResponse = await userGateway.createUser(validUser)
    expect(validResponse.success).toBeTruthy()

    const invalidUser: IUser = makeIUser(
      'testid1',
      'nkm@cs.brown.edu',
      'http://myurl.com/image2',
      []
    )
    const invalidResponse1 = await userGateway.createUser(invalidUser)
    expect(invalidResponse1.success).toBeFalsy()
  })
      test('fails to create user when id is of invalid type', async () => {
    const invalidUser: IUser = makeIUser(
       undefined,
      'avd@cs.brown.edu',
      'http://myurl.com/image',
      []
    )
    
    const invalidResponse2 = await userGateway.createUser(invalidUser)
    expect(invalidResponse2.success).toBeFalsy()
  })
        test('fails to create user when email is of invalid type', async () => {
    const invalidUser: IUser = makeIUser(
       'testid1',
      undefined,
      'http://myurl.com/image',
      []
    )
    

    const invalidResponse3 = await userGateway.createUser(invalidUser)
    expect(invalidResponse3.success).toBeFalsy()
  })
  test('fails to create user when image url is of invalid type', async () => {
    const invalidUser: IUser = makeIUser(
       'testid1',
      'avd@cs.brown.edu',
      undefined,
      []
    )
    const invalidResponse4 = await userGateway.createUser(invalidUser)
    expect(invalidResponse4.success).toBeFalsy()
  })

})
