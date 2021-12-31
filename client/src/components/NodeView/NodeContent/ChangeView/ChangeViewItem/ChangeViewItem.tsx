import React from 'react'
import {
  failureServiceResponse,
  INode,
  INodeProperty,
  makeINodeProperty,
} from '../../../../../types'
import // Menu,
// MenuButton,
// MenuItem,
// MenuList,
// Portal,
// Switch,
// Text,
'@chakra-ui/react'
import * as ri from 'react-icons/ri'
import { ContextMenuItems } from '../../../../ContextMenu'
// import { ChangeWrapper } from '../../../../../types/ChangeWrapper'
import './ChangeViewItem.scss'
import { IChange } from '../../../../../types/IChange'
import { NodeGateway } from '../../../../../nodes'
// import { parse } from 'path'

interface IChangeViewProps {
  changeUrlOnClick?: boolean
  change: IChange
  currentNode: INode
}

export const ChangeViewItem = ({
  change,
  changeUrlOnClick,
  currentNode,
}: IChangeViewProps) => {
  // const [isSelected, setIsSelected] = useState(false)

  // const currSelected: boolean = change != null && change.nodeId === node.nodeId

  const parsedChange = JSON.parse(JSON.parse(JSON.stringify(change.prevNode)))
  console.log(parsedChange)

  const revertNode = async () => {
    console.log('parsedChange?.currHeight ' + parsedChange?.currHeight)
    console.log('parsedChange?.currWidth ' + parsedChange?.currWidth)

    // update the content property
    const nodeContentProperty: INodeProperty = makeINodeProperty(
      'content',
      parsedChange?.content
    )
    console.log('nodeContentProperty ' + parsedChange?.content)

    if (currentNode.type === 'image') {
      // update the height property
      const nodeHeightProperty: INodeProperty = makeINodeProperty(
        'currHeight',
        parsedChange?.currHeight
      )
      console.log('nodeHeightProperty item ' + parsedChange?.currHeight)

      // update the width property
      const nodeWidthProperty: INodeProperty = makeINodeProperty(
        'currWidth',
        parsedChange?.currWidth
      )
      console.log('nodeWidthProperty item ' + parsedChange?.currWidth)

      const dimUpdateResp = await NodeGateway.updateNode(currentNode.nodeId, [
        nodeHeightProperty,
        nodeWidthProperty,
      ])
      if (!dimUpdateResp.success) {
        failureServiceResponse('[ChangeViewItem] node dimensions did not update')
      }
      console.log(dimUpdateResp)
    }

    // update the change array property
    const prevChangeArrayProperty: INodeProperty = makeINodeProperty(
      'prevChangeArray',
      parsedChange?.prevChangeArray
    )
    console.log('prevChangeArrayProperty ' + parsedChange?.prevChangeArray)

    // update the filePath property
    const filePathProperty: INodeProperty = makeINodeProperty(
      'filePath',
      parsedChange?.filePath
    )
    console.log('filePathProperty ' + parsedChange?.filePath)

    // update the title property
    const titleProperty: INodeProperty = makeINodeProperty('title', parsedChange?.title)
    console.log('titleProperty ' + parsedChange?.title)

    const contentUpdateResp = await NodeGateway.updateNode(currentNode.nodeId, [
      nodeContentProperty,
      prevChangeArrayProperty,
      filePathProperty,
      titleProperty,
    ])
    if (!contentUpdateResp.success) {
      failureServiceResponse('[ChangeViewItem] node content did not update')
    }
    console.log('curr node content ' + currentNode.content)
    console.log(contentUpdateResp)
  }

  /* Method called on link right click */
  const handleVersionRightClick = () => {
    // Open custom context menu
    ContextMenuItems.splice(1, ContextMenuItems.length)
    const menuItem: JSX.Element = (
      <div
        key={'versionRevert'}
        className="contextMenuItem"
        onClick={(e) => {
          // set current node to prevNode
          ContextMenuItems.splice(0, ContextMenuItems.length)
          // reload
          window.location.reload()
          console.log('hurray ' + parsedChange?.content)
          console.log('contextMenu len: ' + ContextMenuItems.length)
          revertNode()
        }}
      >
        <div className="itemText">
          <ri.RiArrowLeftCircleLine />
          Revert to version
        </div>
      </div>
    )
    ContextMenuItems.push(menuItem)
  }

  switch (parsedChange?.type) {
    case 'image':
      return (
        <div className="changeView-item" onContextMenu={handleVersionRightClick}>
          <div className="item-wrapper">
            <div className="text-wrapper">
              <div className="left-change">
                <img className="user-info" src={change?.user.imgUrl} />
                <b>{change?.user ? change?.user.email : ''}</b>
                <span></span>
              </div>
              <div className="content-wrapper">
                <li> Height: {parsedChange?.currHeight} </li>
                <li> Width: {parsedChange?.currWidth} </li>
              </div>
            </div>
            <div className="version-info">
              <p>
                {' '}
                {new Date(change?.timeStamp).toLocaleDateString('en-US')},{' '}
                {new Date(change?.timeStamp).toLocaleTimeString('en-US')}{' '}
              </p>
            </div>
          </div>
        </div>
        // <div className="changeView-item" onContextMenu={handleVersionRightClick}>
        //   <div className={'item-wrapper '}>
        //     <div className="text-wrapper">
        //       <b>Date: </b> {new Date(change?.timeStamp).toLocaleDateString('en-US')}
        //       <br></br>
        //       <b>Time: </b> {new Date(change?.timeStamp).toLocaleTimeString('en-US')}
        //       <li> User: {change?.user.email} </li>
        //       <li> Height: {parsedChange?.currHeight} </li>
        //       <li> Width: {parsedChange?.currWidth} </li>
        //     </div>
        //   </div>
        // </div>
      )
      break
    case 'sheet':
      return (
        <div className="changeView-item" onContextMenu={handleVersionRightClick}>
          <div className="item-wrapper">
            <div className="text-wrapper">
              <div className="left-change">
                <img className="user-info" src={change?.user.imgUrl} />
                <b>{change?.user ? change?.user.email : ''}</b>
              </div>
            </div>
            <div className="version-info">
              <p>
                {' '}
                {new Date(change?.timeStamp).toLocaleDateString('en-US')},{' '}
                {new Date(change?.timeStamp).toLocaleTimeString('en-US')}{' '}
              </p>
            </div>
          </div>
        </div>
        // <div className="changeView-item" onContextMenu={handleVersionRightClick}>
        //   <div className={'item-wrapper '}>
        //     <div className="text-wrapper">
        //       <b>Date: </b> {new Date(change?.timeStamp).toLocaleDateString('en-US')}
        //       <br></br>
        //       <b>Time: </b> {new Date(change?.timeStamp).toLocaleTimeString('en-US')}
        //       <li> User: {change?.user.email} </li>
        //       {/* <li> Current Content: {parsedChange?.content} </li> */}
        //     </div>
        //   </div>
        // </div>
      )
      break
    case 'text':
      return (
        <div className="changeView-item" onContextMenu={handleVersionRightClick}>
          <div className="item-wrapper">
            <div className="text-wrapper">
              <div className="left-change">
                <img className="user-info" src={change?.user.imgUrl} />
                <b>{change?.user ? change?.user.email : ''}</b>
                <span></span>
              </div>
              <div
                className="content-wrapper"
                dangerouslySetInnerHTML={{ __html: parsedChange?.content }}
              ></div>
            </div>
            <div className="version-info">
              <p>
                {' '}
                {new Date(change?.timeStamp).toLocaleDateString('en-US')},{' '}
                {new Date(change?.timeStamp).toLocaleTimeString('en-US')}{' '}
              </p>
            </div>
          </div>
        </div>
      )
      break
  }
  return null
}
