import {
  IServiceResponse,
  failureServiceResponse,
  successfulServiceResponse,
  IAnchor,
  isIAnchor,
  Extent,
} from '../types'
import { MongoClient } from 'mongodb'

/**
 * AnchorCollectionConnection acts as an in-between communicator between
 * the MongoDB database and AnchorGateway. AnchorCollectionConnection
 * defines methods that interact directly with MongoDB. That said,
 * it does not include any of the complex logic that AnchorGateway has.
 * Note, currently, AnchorGateway is very simple. But as we add more complexity
 * to our system, we will implement that logic in AnchorGateway.
 *
 * @param {MongoClient} client
 * @param {string} collectionName
 */
export class AnchorCollectionConnection {
  client: MongoClient
  collectionName: string

  constructor(mongoClient: MongoClient, collectionName?: string) {
    this.client = mongoClient
    this.collectionName = collectionName ?? 'anchors'
  }

  /**
   * Inserts a new anchor into the database
   * Returns successfulServiceResponse with IAnchor that was inserted as the payload
   *
   * TODO:
   * Implement this method. Note, it is almost identical to
   * NodeCollectionConnection.insertNode(). So we recommend looking at the code from
   * insertNode to figure this one out.
   *
   * @param {IAnchor} anchor
   * @return successfulServiceResponse<IAnchor> if successful insertion
   *         failureServiceResponse if failed to insert
   */
  async insertAnchor(anchor: IAnchor): Promise<IServiceResponse<IAnchor>> {
    if (!isIAnchor(anchor)) {
      return failureServiceResponse(
        'Failed to insert anchor due to improper input ' +
          'to anchorCollectionConnection.insertAnchor'
      )
    }
    const insertResponse = await this.client
      .db()
      .collection(this.collectionName)
      .insertOne(anchor)
    if (insertResponse.insertedCount) {
      return successfulServiceResponse(insertResponse.ops[0])
    }
    return failureServiceResponse(
      'Failed to insert anchor, insertCount: ' + insertResponse.insertedCount
    )
  }

  /**
   * Clears the entire anchor collection in the database.
   *
   * TODO:
   * Implement this method. Refer to NodeCollectionConnection.clearNodeCollection().
   *
   * @return successfulServiceResponse<{}> on success
   *         failureServiceResponse on failure
   */
  async clearAnchorCollection(): Promise<IServiceResponse<{}>> {
    const response = await this.client.db().collection(this.collectionName).deleteMany({})
    if (response.result.ok) {
      return successfulServiceResponse({})
    }
    return failureServiceResponse('Failed to clear anchor collection.')
  }

  /**
   * Finds Anchor by its unique anchorId
   *
   * TODO:
   * Implement this method. Refer to NodeCollectionConnection.findNodeById().
   *
   * @param {string} anchorId
   * @return successfulServiceResponse<IAnchor> on success
   *         failureServiceResponse on failure
   */
  async findAnchorById(anchorId: string): Promise<IServiceResponse<IAnchor>> {
    const findResponse = await this.client
      .db()
      .collection(this.collectionName)
      .findOne({ anchorId: anchorId })
    if (findResponse == null) {
      return failureServiceResponse('Failed to find anchor with this anchorId.')
    } else {
      return successfulServiceResponse(findResponse)
    }
  }

  /**
   * Finds anchors when given a list of anchorIds.
   * Note, we return successfulServiceResponse with empty array when no anchors found.
   *
   * TODO:
   * Implement this method. Refer to NodeCollectionConnection.findNodesById().
   *
   * @param {string[]} anchorIds
   * @return successfulServiceResponse<IAnchor[]>
   */
  async findAnchorsById(anchorIds: string[]): Promise<IServiceResponse<IAnchor[]>> {
    const foundAnchors: IAnchor[] = []
    await this.client
      .db()
      .collection(this.collectionName)
      .find({ anchorId: { $in: anchorIds } })
      .forEach(function(doc) {
        foundAnchors.push(doc)
      })
    return successfulServiceResponse(foundAnchors)
  }

  /**
   * Deletes anchor with the given anchorId.
   *
   * TODO:
   * Implement this method. Refer to NodeCollectionConnection.deleteNode().
   *
   * @param {string} anchorId
   * @return successfulServiceResponse<IAnchor> on success
   *         failureServiceResponse on failure
   */
  async deleteAnchor(anchorId: string): Promise<IServiceResponse<{}>> {
    const collection = await this.client.db().collection(this.collectionName)
    const deleteResponse = await collection.deleteOne({ anchorId: anchorId })
    if (deleteResponse.result.ok) {
      return successfulServiceResponse({})
    }
    return failureServiceResponse('Failed to delete')
  }

  /**
   * Deletes anchors when given a list of anchorIds.
   *
   * TODO:
   * Implement this method. Refer to NodeCollectionConnection.deleteNodes().
   *
   * @param {string[]} anchorIds
   * @return successfulServiceResponse<IAnchor> on success
   *         failureServiceResponse on failure
   */
  async deleteAnchors(anchorIds: string[]): Promise<IServiceResponse<{}>> {
    const collection = await this.client.db().collection(this.collectionName)
    const myQuery = { anchorId: { $in: anchorIds } }
    const deleteResponse = await collection.deleteMany(myQuery)
    if (deleteResponse.result.ok) {
      return successfulServiceResponse({})
    }
    return failureServiceResponse('Failed to delete anchors')
  }

  /**
   * Finds and returns all anchors attached to a given node.
   *
   * TODO:
   * Implement this method. Now that you have some experience with making these
   * AnchorCollectionConnection methods, try this one without a reference!
   * This one is relatively simple.
   *
   * @param {string[]} anchorIds
   * @return successfulServiceResponse<IAnchor> on success
   *         failureServiceResponse on failure
   */
  async findAnchorsByNodeId(nodeId: string): Promise<IServiceResponse<IAnchor[]>> {
    const foundAnchors = []
    const myQuery = { nodeId: nodeId }
    await this.client
      .db()
      .collection(this.collectionName)
      .find(myQuery)
      .forEach(function(doc) {
        foundAnchors.push(doc)
      })
    return successfulServiceResponse(foundAnchors)
  }

  /**
   * Updates extent of anchor with a specific anchorId
   *
   * @param {string[]} anchorIds
   * @return successfulServiceResponse<IAnchor> on success
   *         failureServiceResponse on failure
   */
  async updateExtent(
    anchorId: string,
    extent: Extent
  ): Promise<IServiceResponse<IAnchor>> {
    const updateResponse = await this.client
      .db()
      .collection(this.collectionName)
      .findOneAndUpdate(
        { anchorId: anchorId },
        { $set: { extent: extent } },
        { returnOriginal: false }
      )
    if (updateResponse.ok && updateResponse.lastErrorObject.n) {
      return successfulServiceResponse(updateResponse.value)
    }
    return failureServiceResponse(
      'Failed to update anchor, lastErrorObject: ' +
        updateResponse.lastErrorObject.toString()
    )
  }
}
