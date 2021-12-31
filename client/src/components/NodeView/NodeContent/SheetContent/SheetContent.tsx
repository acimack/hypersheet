import React, { useState } from 'react'
import { NodeGateway } from '../../../../nodes'
import Spreadsheet, { CellBase, Matrix } from 'react-spreadsheet'
import {
  Extent,
  failureServiceResponse,
  IAnchor,
  ISheetNode,
  // ISheetExtent,
  INode,
  INodeProperty,
  makeINodeProperty,
  makeINode,
  makeIChange,
  IUser,
} from '../../../../types'
import { Button } from '../../../Button'
import './SheetContent.scss'

interface ISheetContentProps {
  currentNode: ISheetNode
  currentUser: IUser
  selectedAnchors: IAnchor[]
  setSelectedExtent: (extent: Extent | null) => void
  setSelectedAnchors: (anchor: IAnchor[]) => void // setter for selectedAnchors
  setSelectedNode: (node: INode) => void // setter for selectedNode
  refresh: boolean
  startAnchor: IAnchor | null
}

/** The content of an image node, including any anchors */
export const SheetContent = (props: ISheetContentProps) => {
  const {
    currentNode,
    currentUser,
    // selectedAnchors,
    setSelectedExtent,
    // setSelectedAnchors,
    // refresh,
    // startAnchor,
  } = props

  const r = currentNode.origRows
  const c = currentNode.origCols
  const row: { value: string }[] = []
  const col: { value: string }[][] = []
  for (let i = 1; i <= c; i++) {
    row.push({ value: '' })
  }
  for (let i = 1; i <= r; i++) {
    col.push(row)
  }

  // State variable for current node change list
  const [nodePrevChangeArray, setNodePrevChangeArray] = useState(
    currentNode.prevChangeArray
  )

  const handleSheetEdit = async (sheet: Matrix<CellBase<any>>) => {
    const nodeProperty: INodeProperty = makeINodeProperty('content', sheet)
    await NodeGateway.updateNode(currentNode.nodeId, [nodeProperty])
  }

  interface rowColPair {
    row: number
    column: number
  }
  const onSelection = ({ row, column }: rowColPair) => {
    const selectedExtent: Extent = {
      type: 'sheet',
      row: row,
      column: column,
    }
    setSelectedExtent(selectedExtent)
  }

  /* versioning */
  /* Method to update the node content */
  const handleUpdateNodeContent = async () => {
    // save is clicked
    // create a copy of the current node
    // node id = length of change array + node id
    // create a change object
    // set the prevNode field of change object to the current node copy
    // push the change object onto the current node's list of changes
    // we update the current content of the node

    // if there is not a prevChangeArray initialized, set it to an []
    if (!currentNode.prevChangeArray) {
      currentNode.prevChangeArray = []
    }

    // create copy node's id
    const copyNodeId = currentNode.prevChangeArray?.length + currentNode.nodeId
    console.log('copyNodeId: ' + copyNodeId)

    // get current node's content
    const getCurrentNodeResp = await NodeGateway.getNode(currentNode.nodeId)
    if (!getCurrentNodeResp.success) {
      failureServiceResponse('[TextEditorTools] node change did not update')
    }

    // create copy of node pre-update
    const copyOfCurrentNode = makeINode(
      copyNodeId,
      currentNode.filePath.path,
      currentNode.prevChangeArray,
      currentNode.filePath.children,
      currentNode.type,
      currentNode.title,
      getCurrentNodeResp.payload?.content
    )

    // create a change object
    const newChangeObject = makeIChange(
      currentUser,
      new Date(),
      JSON.stringify(copyOfCurrentNode)
    )

    // unshift the change object onto the array of changes (add to the beginning)
    if (currentNode.prevChangeArray) {
      currentNode.prevChangeArray?.unshift(newChangeObject)
      console.log('change array length ' + currentNode.prevChangeArray.length)
      currentNode.prevChangeArray.forEach((change) => {
        console.log(change)
      })
      setNodePrevChangeArray(currentNode.prevChangeArray)
    }
    // update the change property
    const prevChangeProperty: INodeProperty = makeINodeProperty(
      'prevChangeArray',
      nodePrevChangeArray
    )
    console.log('changeProperty value ' + prevChangeProperty.value)
    const changeUpdateResp = await NodeGateway.updateNode(currentNode.nodeId, [
      prevChangeProperty,
    ])
    if (!changeUpdateResp.success) {
      failureServiceResponse('[TextEditorTools] node change did not update')
    }
    console.log(changeUpdateResp)
  }

  // const [data, setData] = useState(col)

  return (
    <div>
      <div className="sheet-tools">
        <Button onClick={() => handleUpdateNodeContent()} icon={<b>Save Version</b>} />
      </div>
      <div className="sheetWrapper">
        <Spreadsheet
          data={currentNode.content}
          onChange={(data) => handleSheetEdit(data)}
          onActivate={onSelection}
        />
      </div>
    </div>
  )
}
