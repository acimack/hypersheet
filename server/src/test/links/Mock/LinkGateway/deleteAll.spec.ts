import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { LinkGateway } from '../../../../links'
import { ILink, makeILink } from '../../../../types'

describe('Unit Test: Delete All', () => {
  let uri
  let mongoClient
  let linkGateway
  let mongoMemoryServer

  beforeAll(async () => {
    mongoMemoryServer = await MongoMemoryServer.create()
    uri = mongoMemoryServer.getUri()
    mongoClient = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    linkGateway = new LinkGateway(mongoClient)
    mongoClient.connect()
  })

  afterAll(async () => {
    await mongoClient.close()
    await mongoMemoryServer.stop()
  })

  test('successfully deletes all links', async () => {
    const validLink1: ILink = makeILink('link1', 'anchor1', 'anchor2', 'node1', 'node2')
    const response1 = await linkGateway.createLink(validLink1)
    expect(response1.success).toBeTruthy()

    const validLink2: ILink = makeILink('link2', 'anchor1', 'anchor2', 'node1', 'node2')
    const response2 = await linkGateway.createLink(validLink2)
    expect(response2.success).toBeTruthy()

    const validLink3: ILink = makeILink('link3', 'anchor1', 'anchor2', 'node1', 'node2')
    const response3 = await linkGateway.createLink(validLink3)
    expect(response3.success).toBeTruthy()

    const deleteAllResp = await linkGateway.deleteAll()
    expect(deleteAllResp.success).toBeTruthy()

    const findLink1Resp = await linkGateway.getLinkById('link1')
    expect(findLink1Resp.success).toBeFalsy()
    const findLink2Resp = await linkGateway.getLinkById('link2')
    expect(findLink2Resp.success).toBeFalsy()
    const findLink3Resp = await linkGateway.getLinkById('link3')
    expect(findLink3Resp.success).toBeFalsy()
  })
})
