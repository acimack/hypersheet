import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { generateObjectId } from '../../../global'
import { NodeGateway } from '../../../nodes'
import {
  IFilePath,
  IFolderNode,
  INode,
  IImageNode,
  ISheetNode,
  makeIFilePath,
  makeINode,
  NodeIdsToNodesMap,
  NodeType,
} from '../../../types'
import { makeIChange } from '../../../types/IChange'

export async function http<T>(request: AxiosRequestConfig): Promise<T> {
  const response: AxiosResponse<T> = await axios(request)
  return response.data
}

export interface ICreateNodeModalAttributes {
  content: string
  nodeIdsToNodesMap: NodeIdsToNodesMap
  parentNodeId: string | null
  title: string
  type: NodeType // if null, add node as a root
  sheetRows: string
  sheetCols: string
}

/**
 *
 * The metadata of the image is added. This should be
 * used when the user imports the image / before
 * it gets added into the database
 *
 * @input imageUrl
 * @output An object with the following interface:
 * {
 *    normalizedHeight: number
 *    normalizedWidth: number
 * }
 */
export const getMeta = async (imageUrl: string) => {
  const img = new Image()
  let naturalHeight: number = 0
  let naturalWidth: number = 0
  let normalizedHeight: number = 0
  let normalizedWidth: number = 0
  img.src = imageUrl
  const promise = await new Promise<{
    normalizedHeight: number
    normalizedWidth: number
  }>((resolve) => {
    img.addEventListener('load', function() {
      naturalWidth = img.naturalWidth
      naturalHeight = img.naturalHeight
      // The height and the width are normalized so that the height will always be 300px
      const mult = 300 / naturalHeight
      normalizedHeight = mult * naturalHeight
      normalizedWidth = mult * naturalWidth
      resolve({ normalizedHeight: normalizedHeight, normalizedWidth: normalizedWidth })
    })
  })
  return {
    normalizedHeight: promise.normalizedHeight,
    normalizedWidth: promise.normalizedWidth,
  }
}

/** Create a new node based on the inputted attributes in the modal */
export async function createNodeFromModal({
  title,
  type,
  parentNodeId,
  content,
  nodeIdsToNodesMap,
  sheetRows,
  sheetCols,
}: ICreateNodeModalAttributes): Promise<INode | null> {
  const nodeId = generateObjectId(type)
  // Initial filePath value: create node as a new root
  let filePath: IFilePath = makeIFilePath([nodeId])
  // If parentNodeId is provided, we edit filePath so that we can
  // create the node as a child of the parent
  if (parentNodeId) {
    const parentNode = nodeIdsToNodesMap[parentNodeId]
    if (parentNode) {
      filePath = makeIFilePath(parentNode.filePath.path.concat([nodeId]))
    } else {
      console.error('Error: parent node is null')
    }
  }

  const copyOfCurrentNode = makeINode(
    nodeId,
    filePath.path,
    filePath.children,
    type,
    title,
    content
  )

  // create a change object
  const newChangeObject = makeIChange('a change', new Date(), copyOfCurrentNode)
  console.log(newChangeObject)

  // TODO [Editable]: What should `newNode` look like for an image?
  let newNode: INode | IFolderNode | IImageNode | ISheetNode
  switch (type) {
    case 'folder':
      newNode = {
        content: content,
        dateCreated: new Date(),
        filePath: filePath,
        nodeId: nodeId,
        title: title,
        type: type,
        viewType: 'grid',
        prevChangeArray: [],
      }
      break
    case 'image':
      // make sure that image has correct metadata
      const metaData = getMeta(content)
      newNode = {
        content: content,
        dateCreated: new Date(),
        filePath: filePath,
        nodeId: nodeId,
        title: title,
        type: type,
        origWidth: (await metaData).normalizedHeight,
        origHeight: (await metaData).normalizedWidth,
        currWidth: (await metaData).normalizedHeight,
        currHeight: (await metaData).normalizedWidth,
        prevChangeArray: [],
      }
      break
    case 'sheet':
      const sheet = setUpSheet(parseInt(sheetRows), parseInt(sheetCols))
      newNode = {
        content: sheet,
        dateCreated: new Date(),
        filePath: filePath,
        nodeId: nodeId,
        title: title,
        type: type,
        origCols: parseInt(sheetCols),
        origRows: parseInt(sheetRows),
        currCols: parseInt(sheetCols),
        currRows: parseInt(sheetRows),
        prevChangeArray: [],
      }
      break
    default:
      newNode = {
        content: content,
        dateCreated: new Date(),
        filePath: filePath,
        nodeId: nodeId,
        title: title,
        type: type,
        prevChangeArray: [],
      }
  }

  const nodeResponse = await NodeGateway.createNode(newNode)
  if (nodeResponse.success) {
    return nodeResponse.payload
  } else {
    console.error('Error: ' + nodeResponse.message)
    return null
  }
}
const setUpSheet = (rows: number, cols: number): { value: string }[][] => {
  const row: { value: string }[] = []
  const col: { value: string }[][] = []
  for (let i = 1; i <= cols; i++) {
    row.push({ value: '' })
  }
  for (let i = 1; i <= rows; i++) {
    col.push(row)
  }
  return col
}

export const uploadImage = async (file: any): Promise<string> => {
  // begin file upload
  console.log('Uploading file to Imgur..')

  // using key for imgur API
  const apiUrl = 'https://api.imgur.com/3/image'
  const apiKey = 'f18e19d8cb9a1f0'

  const formData = new FormData()
  formData.append('image', file)

  try {
    const data: any = await http({
      data: formData,
      headers: {
        Accept: 'application/json',
        Authorization: 'Client-ID ' + apiKey,
      },
      method: 'POST',
      url: apiUrl,
    })
    return data.data.link
  } catch (exception) {
    return 'Image was not uploaded'
  }
}
