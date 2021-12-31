import { isSameFilePath } from '.'
import { IChange } from './IChange'
import IFilePath, { makeIFilePath } from './IFilePath'

export const nodeTypes: string[] = [
  'text',
  'video',
  'pdf',
  'image',
  'audio',
  'folder',
  'sheet',
]
export type NodeType = 'text' | 'video' | 'pdf' | 'image' | 'audio' | 'folder' | 'sheet'

export interface INode {
  type: NodeType // type of node that is created
  content: any // the content of the node
  filePath: IFilePath // unique randomly generated ID which contains the type as a prefix
  nodeId: string // unique randomly generated ID which contains the type as a prefix
  title: string // user create node title
  dateCreated?: Date // date that the node was created
  prevChangeArray: any[],
}

export interface IImageNode extends INode {
  origWidth: any
  origHeight: any
  currWidth: any
  currHeight: any
}

export interface ISheetNode extends INode {
  origRows: any
  origCols: any
  currRows: any
  currCols: any
}

export type FolderContentType = 'list' | 'grid'

export interface IFolderNode extends INode {
  viewType: FolderContentType
}

export type NodeFields =
  | keyof INode
  | keyof IFolderNode
  | keyof IImageNode
  | keyof ISheetNode

export const allNodeFields: string[] = [
  'nodeId',
  'title',
  'type',
  'content',
  'filePath',
  'viewType',
  'prevChangeArray',
  'origHeight',
  'origWidth',
  'currHeight',
  'currWidth',
  'origRows',
  'origCols',
  'currRows',
  'currCols',
]

export function isINode(object: any): object is INode {
  const propsDefined: boolean =
    typeof (object as INode).nodeId !== 'undefined' &&
    typeof (object as INode).title !== 'undefined' &&
    typeof (object as INode).type !== 'undefined' &&
    typeof (object as INode).content !== 'undefined' &&
    typeof (object as INode).filePath !== 'undefined'
  const filePath: IFilePath = object.filePath
  // if both are defined
  if (filePath && propsDefined) {
    for (let i = 0; i < filePath.path.length; i++) {
      if (typeof filePath.path[i] !== 'string') {
        return false
      }
    }
    // check if all fields have the right type
    // and verify if filePath.path is properly defined
    return (
      typeof (object as INode).nodeId === 'string' &&
      typeof (object as INode).title === 'string' &&
      nodeTypes.includes((object as INode).type) &&
      // typeof (object as INode).content === 'string' &&
      filePath.path.length > 0 &&
      filePath.path[filePath.path.length - 1] === (object as INode).nodeId
    )
  }
}

export function makeINode(
  nodeId: any,
  path: any,
  children?: any,
  type?: any,
  title?: any,
  content?: any,
  prevChangeArray?: any,
  ): INode {
  return {
    nodeId: nodeId,
    title: title ?? 'node' + nodeId,
    type: type ?? 'text',
    content: content ?? 'content' + nodeId,
    filePath: makeIFilePath(path, children),
    prevChangeArray: prevChangeArray ?? [],
  }
}

export function isSameNode(n1: INode, n2: INode): boolean {
  return (
    n1.nodeId === n2.nodeId &&
    n1.title === n2.title &&
    n1.type === n2.type &&
    n1.content === n2.content &&
    isSameFilePath(n1.filePath, n2.filePath)
  )
}
