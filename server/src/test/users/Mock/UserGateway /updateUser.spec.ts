import { isSameUser, IUser, makeIUser, makeIUserProperty } from '../../../..'
import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { UserGateway } from '../../../../users'

describe('Unit Test: Update user', () => {
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
    const validUser: IUser = makeIUser(
      'testid1',
      'avd@cs.brown.edu',
      'http://myurl.com/image',
      []
    )
    const createResponse = await userGateway.createUser(validUser)
    expect(createResponse.success).toBeTruthy()
  })
  afterAll(async () => {
    await mongoClient.close()
    await mongoMemoryServer.stop()
  })

  // should i have tests for if the field name is wrong?
  test('successfully updates a user\'s field', async () => {
    const updateResp = await userGateway.updateUser('testid1', [
      makeIUserProperty('email', 'lgelfond@cs.brown.edu'),
      makeIUserProperty('imgUrl', 'http://reboothq.substack.com'),
    ])
    expect(updateResp.success).toBeTruthy()
    expect(updateResp.payload.email === 'lgelfond@cs.brown.edu').toBeTruthy()
    expect(updateResp.payload.imgUrl === 'http://reboothq.substack.com').toBeTruthy()
    const findUserByIdResp = await userGateway.getUserById('testid1')
    expect(findUserByIdResp.payload.email === 'lgelfond@cs.brown.edu').toBeTruthy()
    expect(
      findUserByIdResp.payload.imgUrl === 'http://reboothq.substack.com'
    ).toBeTruthy()
  })
  test('fails to update user when field value is incorrect type', async () => {
    const updateResp = await userGateway.updateUser('testid1', [
      makeIUserProperty('email', 133),
    ])
    expect(updateResp.success).toBeFalsy()
    const findUserByIdResp = await userGateway.getUserById('testid1')
    const validUser: IUser = makeIUser(
      'testid1',
      'avd@cs.brown.edu',
      'http://myurl.com/image',
      []
    )
    expect(isSameUser(validUser, findUserByIdResp.payload)).toBeTruthy()
  })
})
