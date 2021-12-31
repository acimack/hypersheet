import React, { useRef, useState } from 'react'
import {
  Extent,
  IAnchor,
  IFolderNode,
  INode,
  // makeINode,
  ISheetNode,
  IImageNode,
} from '../../../types'
import { FolderContent } from './FolderContent'
import { ImageContent } from './ImageContent'
import './NodeContent.scss'
import { SheetContent } from './SheetContent'
import { TextEditor } from './TextEditor'
import { ChangeView } from './ChangeView'
// import { makeIChange } from '../../../types/IChange'
import { Button } from '../../Button'
import { IUser } from '../../../types/IUser'

/** Props needed to render any node content */

export interface INodeContentProps {
  currentUser: IUser
  childNodes?: INode[]
  currentNode: INode
  onCreateNodeButtonClick: () => void
  onDeleteButtonClick: (node: INode) => void
  onMoveButtonClick: (node: INode) => void
  setSelectedNode: (node: INode) => void
  setSelectedExtent: (extent: Extent | null | undefined) => void
  selectedAnchors: IAnchor[]
  setSelectedAnchors: (anchor: IAnchor[]) => void
  refresh: boolean
  startAnchor: IAnchor | null
}

/**
 * This is the node content.
 *
 * @param props: INodeContentProps
 * @returns Content that any type of node renders
 */
export const NodeContent = (props: INodeContentProps) => {
  const {
    currentUser,
    currentNode,
    setSelectedExtent,
    onCreateNodeButtonClick,
    onDeleteButtonClick,
    onMoveButtonClick,
    setSelectedNode,
    startAnchor,
    childNodes,
    selectedAnchors,
    setSelectedAnchors,
    refresh,
  } = props

  const [showPrevVersions, setShowPrevVersions] = useState(false)

  const changeView = useRef<HTMLHeadingElement>(null)
  switch (currentNode.type) {
    case 'image':
      return showPrevVersions ? (
        <div>
          <ImageContent
            currentUser={currentUser}
            currentNode={currentNode as IImageNode}
            selectedAnchors={selectedAnchors}
            setSelectedAnchors={setSelectedAnchors}
            setSelectedExtent={setSelectedExtent}
            setSelectedNode={setSelectedNode}
            startAnchor={startAnchor}
            refresh={refresh}
          />
          <div className="change-button">
            <Button
              onClick={() => {
                setShowPrevVersions(!showPrevVersions)
              }}
              icon={<p>Hide Previous Versions</p>}
            />
          </div>
          {/* <div className="changeView-container" ref={changeView}
          style={{ width: 700 }}> */}
          <div className="changeView-container" ref={changeView}>
            <ChangeView currentNode={currentNode} />
          </div>
          <div className="divider" />
        </div>
      ) : (
        <div>
          <ImageContent
            currentUser={currentUser}
            currentNode={currentNode as IImageNode}
            selectedAnchors={selectedAnchors}
            setSelectedAnchors={setSelectedAnchors}
            setSelectedExtent={setSelectedExtent}
            setSelectedNode={setSelectedNode}
            startAnchor={startAnchor}
            refresh={refresh}
          />
          <div className="change-button">
            <Button
              onClick={() => {
                setShowPrevVersions(!showPrevVersions)
              }}
              // style={{ height: 30 + 'px', margin: 'auto' }}
              icon={<p>See Previous Versions</p>}
            />
          </div>
          <div className="divider" />
        </div>
      )
      break
    case 'sheet':
      return showPrevVersions ? (
        <div>
          <SheetContent
            currentNode={currentNode as ISheetNode}
            currentUser={currentUser}
            selectedAnchors={selectedAnchors}
            setSelectedAnchors={setSelectedAnchors}
            setSelectedExtent={setSelectedExtent}
            setSelectedNode={setSelectedNode}
            startAnchor={startAnchor}
            refresh={refresh}
          />
          <div className="change-button">
            <Button
              onClick={() => {
                setShowPrevVersions(!showPrevVersions)
              }}
              icon={<p>Hide Previous Versions</p>}
            />
          </div>
          {/* <div className="changeView-container"
          ref={changeView} style={{ width: 700 }}> */}
          <div className="changeView-container" ref={changeView}>
            <ChangeView currentNode={currentNode} />
          </div>
          <div className="divider" />
        </div>
      ) : (
        <div>
          <SheetContent
            currentNode={currentNode as ISheetNode}
            currentUser={currentUser}
            selectedAnchors={selectedAnchors}
            setSelectedAnchors={setSelectedAnchors}
            setSelectedExtent={setSelectedExtent}
            setSelectedNode={setSelectedNode}
            startAnchor={startAnchor}
            refresh={refresh}
          />
          <div className="change-button">
            <Button
              onClick={() => {
                setShowPrevVersions(!showPrevVersions)
              }}
              style={{ margin: 'auto' }}
              icon={<p>See Previous Versions</p>}
            />
          </div>
          <div className="divider" />
        </div>
      )
      break
    case 'text':
      return showPrevVersions ? (
        <div>
          <TextEditor
            currentUser={currentUser}
            currentNode={currentNode}
            selectedAnchors={selectedAnchors}
            setSelectedAnchors={setSelectedAnchors}
            setSelectedExtent={setSelectedExtent}
            setSelectedNode={setSelectedNode}
            startAnchor={startAnchor}
            refresh={refresh}
          />
          <div className="change-button">
            <Button
              onClick={() => {
                setShowPrevVersions(!showPrevVersions)
              }}
              icon={<p>Hide Previous Versions</p>}
            />
          </div>
          {/* <div className="changeView-container"
          ref={changeView} style={{ width: 700 }}> */}
          <div className="changeView-container" ref={changeView}>
            <ChangeView currentNode={currentNode} />
          </div>
          <div className="divider" />
        </div>
      ) : (
        <div>
          <TextEditor
            currentUser={currentUser}
            currentNode={currentNode}
            selectedAnchors={selectedAnchors}
            setSelectedAnchors={setSelectedAnchors}
            setSelectedExtent={setSelectedExtent}
            setSelectedNode={setSelectedNode}
            startAnchor={startAnchor}
            refresh={refresh}
          />
          <div className="change-button">
            <Button
              onClick={() => {
                setShowPrevVersions(!showPrevVersions)
              }}
              // style={{ height: 30 + 'px', margin: 'auto' }}
              icon={<p>See Previous Versions</p>}
            />
          </div>
          <div className="divider" />
        </div>
      )
      break
    case 'folder':
      if (childNodes) {
        return (
          <FolderContent
            node={currentNode as IFolderNode}
            onCreateNodeButtonClick={onCreateNodeButtonClick}
            onDeleteButtonClick={onDeleteButtonClick}
            onMoveButtonClick={onMoveButtonClick}
            setSelectedExtent={setSelectedExtent}
            setSelectedNode={setSelectedNode}
            childNodes={childNodes}
          />
        )
      }
  }
  return null
}
