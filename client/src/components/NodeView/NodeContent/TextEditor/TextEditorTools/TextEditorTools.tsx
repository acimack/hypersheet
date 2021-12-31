import {
  useActive,
  useChainedCommands,
  useCommands,
  useRemirrorContext,
} from '@remirror/react'
import React, { useCallback, useEffect, useState } from 'react'
import { AnchorGateway } from '../../../../../anchors'
import {
  failureServiceResponse,
  IAnchor,
  INode,
  INodeProperty,
  IServiceResponse,
  makeINode,
  makeINodeProperty,
  makeITextExtent,
} from '../../../../../types'
import './TextEditorTools.scss'
import { Button } from '../../../../Button'
import { NodeGateway } from '../../../../../nodes'
import { NodeWithPosition } from 'remirror'
import { prosemirrorNodeToHtml } from 'remirror'
import { findChildrenByMark } from 'remirror'
import { makeIChange } from '../../../../../types/IChange'
import { IUser } from '../../../../../types/IUser'
interface ITextToolsProps {
  currentUser: IUser
  currentNode: INode
  startAnchor: IAnchor | null
  refresh: boolean
  selectedAnchors: IAnchor[]
}

export const TextEditorTools = (props: ITextToolsProps) => {
  // Deconstruct ITextToolsProps
  const { currentUser, currentNode, refresh } = props

  // State variable for current node content
  const [nodeContent, setNodeContent] = useState(currentNode.content)

  // State variable for current node change list
  const [nodePrevChangeArray, setNodePrevChangeArray] = useState(
    currentNode.prevChangeArray
  )

  /* NOTE THAT YOU DO NOT NEED TO USE ALL OF THESE IMPORTS
  Documentation for them is available here:
  https://remirror.io/docs/getting-started/commands-and-helpers/
  */
  // A core hook which provides the commands for usage in your editor.
  const commands = useCommands()
  // A core hook which provides the chainable commands for usage in your editor.
  const chain = useChainedCommands()
  // This is a shorthand method for retrieving the active available in the editor.
  const active = useActive()
  /**
   * This provides access to the remirror context when using the Remirror.
   *
   * The first argument which is optional can also be a change handler which
   * is called every time the state updates.
   */
  const context = useRemirrorContext()
  // Access the editor state of the current document
  const { doc, schema } = context.getState()
  /* Method to update the node content */
  const handleUpdateNodeContent = async () => {
    // save is clicked
    // we update the current content of the node
    // create a copy of the current node
    // node id = length of change array + node id
    // create a change object
    // set the prevNode field of change object to the current node copy
    // push the change object onto the current node's list of changes

    // update the content property
    const nodeContentProperty: INodeProperty = makeINodeProperty('content', nodeContent)
    console.log('nodeProperty ' + nodeContent)
    console.log('nodeProperty value ' + nodeContentProperty.value)
    const contentUpdateResp = await NodeGateway.updateNode(currentNode.nodeId, [
      nodeContentProperty,
    ])
    if (!contentUpdateResp.success) {
      failureServiceResponse('[TextEditorTools] node content did not update')
    }
    console.log('curr node content ' + currentNode.content)
    console.log(contentUpdateResp)

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

    // adding user stuff

    // update the anchors
    handleUpdateAnchors()
  }

  const addTextAnchorLinks = useCallback(async () => {
    const anchorsFromNodeResp = await AnchorGateway.getAnchorsByNodeId(currentNode.nodeId)
    if (!anchorsFromNodeResp || anchorsFromNodeResp.payload == null) {
      return
    }
    const anchors: IAnchor[] = anchorsFromNodeResp.payload
    anchors.forEach((anchor) => {
      if (anchor.extent && anchor.extent.type == 'text') {
        commands.applyMark(
          'link',
          {
            href: anchor.anchorId,
            auto: false,
          },
          { from: anchor.extent.startCharacter, to: anchor.extent.endCharacter }
        )
      }
    })
  }, [currentNode, refresh])

  /* Method to update anchors (includes deletion) */
  const handleUpdateAnchors = async () => {
    // call find children by mark to get all the links
    const links: NodeWithPosition[] = findChildrenByMark({
      node: doc,
      type: schema.marks.link,
    })
    console.log('links' + links.length)

    // filter out links that dont start with 'anchor'
    links?.filter((link) => {
      const linkHtml = prosemirrorNodeToHtml(link.node)
      const potentialAnchorText = linkHtml.toString().substring(9, 15)
      console.log('links anchor ' + potentialAnchorText)
      potentialAnchorText === 'anchor'
    })

    // update each link with call to AnchorGateway.updateExtent
    const extentUpdatePromises: IServiceResponse<IAnchor>[] = []
    const newIdArray: String[] = []
    links?.forEach(async (link) => {
      // get the anchor id
      const linkHtml = prosemirrorNodeToHtml(link.node)
      console.log('node text content ' + link.node.textContent)

      const anchorId = linkHtml.toString().split('"', 2)[1]
      console.log('anchor id ' + anchorId)

      // get the new extent contents
      const newExtentContent = link.node.textContent

      // get the new extent position
      const newExtentStart = link.pos
      console.log('position ' + link.pos)

      // create new extent object
      const anchorFromIDResp = await AnchorGateway.getAnchor(anchorId)
      if (!anchorFromIDResp || anchorFromIDResp.payload == null) {
        return
      }
      const anchor: IAnchor = anchorFromIDResp.payload
      if (anchor.extent && anchor.extent.type == 'text') {
      }

      // create the new text extent that the anchor will be updated with
      const newExtent = makeITextExtent(
        newExtentContent,
        newExtentStart,
        newExtentStart + newExtentContent.length
      )
      newIdArray.push(anchorId)

      // update anchor extent
      const anchorsFromNodeResp = await AnchorGateway.updateExtent(anchorId, newExtent)
      extentUpdatePromises.push(anchorsFromNodeResp)
    })
    Promise.all(extentUpdatePromises).then((values) => {
      console.log(values)
    })

    // get all the node's anchors from the db (USED FOR DELETE NODE)
    const anchorsFromNodeResp = await AnchorGateway.getAnchorsByNodeId(currentNode.nodeId)
    if (!anchorsFromNodeResp || anchorsFromNodeResp.payload == null) {
      return
    }
    const dbAnchors: IAnchor[] = anchorsFromNodeResp.payload
    console.log('dbAnchorsLength: ' + dbAnchors.length)
    console.log('newIdArray: ' + newIdArray.length)

    // DELETE NODE: If an anchor in db doesn't exist in editor, then delete the anchor
    const anchorToDelete: IServiceResponse<{}>[] = []
    // match anchor id!!!!
    dbAnchors?.forEach(async (dbAnchor) => {
      const dbAnchorID = dbAnchor.anchorId
      // if the anchor is a text anchor
      let foundMatch = 0
      console.log('newIdArray: ' + newIdArray.length)
      // for each anchor in the editor, check if current dbAnchorExtent is match
      newIdArray.forEach(async (editorID) => {
        console.log('dbAnchor : ' + dbAnchorID + 'editorID : ' + editorID)
        if (dbAnchorID == editorID) {
          foundMatch = 1
        }
      })
      // if a matching extent is not found in editor, delete anchor from db
      if (foundMatch === 0) {
        console.log('no match found')
        const deleteAnchorResp = await AnchorGateway.deleteAnchor(dbAnchor.anchorId)
        anchorToDelete.push(deleteAnchorResp)
      }
    })
    Promise.all(anchorToDelete).then((values) => {
      console.log(values)
    })
  }

  useEffect(() => {
    addTextAnchorLinks()
  }, [currentNode])

  useEffect(() => {
    const htmlString = prosemirrorNodeToHtml(doc)
    setNodeContent(htmlString)
  }, [doc])

  useEffect(() => {
    setNodePrevChangeArray(currentNode.prevChangeArray)
  }, [currentNode])

  /* update the content of the node */
  useEffect(() => {
    commands.setContent(currentNode.content)
  }, [currentNode])

  return (
    <>
      <div className="textButtons">
        <Button onClick={() => handleUpdateNodeContent()} icon={<b>Save Version</b>} />
        <span>
          <div className="vertical"></div>
        </span>
        <Button
          onClick={() => {
            chain // Begin a chain
              .toggleBold()
              .focus()
              .run() // A chain must always be terminated with `.run()`
          }}
          style={{ fontWeight: active.bold() ? 'bold' : undefined }}
          icon={<b>B</b>}
        />
        <Button
          onClick={() => {
            chain // Begin a chain
              .toggleItalic()
              .focus()
              .run() // A chain must always be terminated with `.run()`
          }}
          style={{ fontWeight: active.italic() ? 'italic' : undefined }}
          icon={<i>I</i>}
        />
        <Button
          onClick={() => {
            chain // Begin a chain
              .toggleUnderline()
              .focus()
              .run() // A chain must always be terminated with `.run()`
          }}
          style={{ fontWeight: active.underline() ? 'underline' : undefined }}
          icon={<u>U</u>}
        />
        <span>
          <div className="vertical"></div>
        </span>
        {[1, 2, 3].map((level) => (
          <Button
            key={level}
            onClick={() => commands.toggleHeading({ level })}
            style={{ fontWeight: active.heading({ level }) ? 'heading' : undefined }}
            text={'H' + { level }.level}
          />
        ))}
        <span>
          <div className="vertical"></div>
        </span>
        <Button
          onClick={() => {
            commands.setTextHighlight('yellow')
          }}
          style={{ fontWeight: active.textHighlight() ? 'highlight' : undefined }}
          icon={<p>Highlight</p>}
        />
        <Button
          onClick={() => {
            commands.removeTextHighlight()
          }}
          style={{ fontWeight: active.textHighlight() ? 'highlight' : undefined }}
          icon={<del>Highlight</del>}
        />
        <span>
          <div className="vertical"></div>
        </span>
        <Button
          onClick={() => {
            commands.toggleBlockquote()
          }}
          style={{ fontWeight: active.blockquote() ? 'blockquote' : undefined }}
          icon={
            <>
              <q>Quote</q>
            </>
          }
        />
      </div>
    </>
  )
}
