import {
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react'
// import { parse, format } from 'path'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import * as ri from 'react-icons/ri'
import { useHistory } from 'react-router-dom'
import { fetchAnchors, fetchLinks } from '..'
import { AnchorGateway } from '../../../../anchors'
import { NodeGateway } from '../../../../nodes'
import {
  Extent,
  failureServiceResponse,
  IAnchor,
  IImageExtent,
  INode,
  IUser,
  INodeProperty,
  makeINodeProperty,
  // makeINode,
  IImageNode,
  makeIImageNode,
} from '../../../../types'
import { makeIChange } from '../../../../types/IChange'
import { Button } from '../../../Button'
import './ImageContent.scss'

interface IImageContentProps {
  currentUser: IUser
  currentNode: IImageNode
  selectedAnchors: IAnchor[]
  setSelectedExtent: (extent: Extent | null) => void
  setSelectedAnchors: (anchor: IAnchor[]) => void // setter for selectedAnchors
  setSelectedNode: (node: INode) => void // setter for selectedNode
  refresh: boolean
  startAnchor: IAnchor | null
}

/** The content of an image node, including any anchors */
export const ImageContent = (props: IImageContentProps) => {
  const {
    currentUser,
    currentNode,
    selectedAnchors,
    setSelectedExtent,
    setSelectedAnchors,
    refresh,
    startAnchor,
  } = props

  let dragging: boolean = false // Indicated whether we are currently dragging the image
  let currentTop: number // To store the top of the currently selected region for onMove
  let currentLeft: number // To store the left of the currently selected region for onMove
  let xSelectionLast: number // To store the last x for resizing the selection
  let ySelectionLast: number // To store the last y for resizing the selection

  /* State variable to keep track of image's current height */
  const [heightValue, setHeightValue] = useState(currentNode.currHeight)

  /* State variable to keep track of image's current width */
  const [widthValue, setWidthValue] = useState(currentNode.currWidth)

  /* State variable for current node change list */
  const [nodePrevChangeArray, setNodePrevChangeArray] = useState(
    currentNode.prevChangeArray
  )

  /**
   * useRef Here is an example of use ref to store a mutable html object
   * The selection ref is how we can access the selection that we render
   */
  const imageContainer = useRef<HTMLHeadingElement>(null)

  /* This is how we can access currently selected region for making links */
  const selection = useRef<HTMLHeadingElement>(null)

  /* State variable to keep track of anchors rendered on image */
  const [imageAnchors, setImageAnchors] = useState<JSX.Element[]>([])

  /**
   * State variable to keep track of the currently selected anchor IDs
   * Use: Compare with selectedAnchors to update previous state
   */
  const [selectedAnchorIds, setSelectedAnchorIds] = useState<string[]>([])
  const history = useHistory()
  /**
   * Handle click on anchor that is displayed on image
   * Single click: Select the anchor
   * Double click: Navigate to the opposite node
   */
  const handleAnchorSelect = async (e: React.MouseEvent, anchor: IAnchor) => {
    e.stopPropagation()
    e.preventDefault()
    const links = await fetchLinks(anchor.anchorId)
    const anchors = await fetchAnchors(links)
    if (links.length > 0) {
      if (links[0].anchor1Id !== anchor.anchorId) {
        history.push(`/${links[0].anchor1NodeId}/`)
      } else if (links[0].anchor2Id !== anchor.anchorId) {
        history.push(`/${links[0].anchor2NodeId}/`)
      }
      setSelectedExtent(anchor.extent)
      setSelectedAnchors(anchors)
    }
  }

  /**
   * This method displays the existing anchors.
   * We are fetching them from the data with a call to AnchorGateway.getAnchorsByNodeId
   * which returns a list of IAnchors that are on currentNode
   */
  const displayImageAnchors = useCallback(async () => {
    let imageAnchors: IAnchor[]
    const anchorsFromNode = await AnchorGateway.getAnchorsByNodeId(currentNode.nodeId)
    if (anchorsFromNode.success && anchorsFromNode.payload) {
      const anchorElementList: JSX.Element[] = [] // List of anchor elements to return
      imageAnchors = anchorsFromNode.payload // IAnchor array from AnchorGateway call
      imageAnchors.forEach((anchor) => {
        // Checking that the extent is of type image to access IImageExtent
        if (anchor.extent?.type == 'image') {
          if (
            !(
              startAnchor &&
              startAnchor.extent?.type == 'image' &&
              startAnchor == anchor &&
              startAnchor.nodeId == currentNode.nodeId
            )
          ) {
            anchorElementList.push(
              <div
                id={anchor.anchorId}
                key={'image.' + anchor.anchorId}
                className="image-anchor"
                onClick={(e) => {
                  handleAnchorSelect(e, anchor)
                }}
                onPointerDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                style={{
                  height: anchor.extent.height,
                  left: anchor.extent.left,
                  top: anchor.extent.top,
                  width: anchor.extent.width,
                }}
              />
            )
          }
        }
      })
      if (
        startAnchor &&
        startAnchor.extent?.type == 'image' &&
        startAnchor.nodeId == currentNode.nodeId
      ) {
        anchorElementList.push(
          <div
            id={startAnchor.anchorId}
            key={'image.startAnchor' + startAnchor.anchorId}
            className="image-startAnchor"
            style={{
              height: startAnchor.extent.height,
              left: startAnchor.extent.left,
              top: startAnchor.extent.top,
              width: startAnchor.extent.width,
            }}
          />
        )
      }
      setImageAnchors(anchorElementList)
    }

    // display the selected anchors
    selectedAnchorIds.forEach((anchorId) => {
      const prevSelectedAnchor = document.getElementById(anchorId)
      if (prevSelectedAnchor) {
        prevSelectedAnchor.className = 'image-anchor'
      }
    })
    if (imageContainer.current) {
      imageContainer.current.style.outline = ''
    }
    const newSelectedAnchorIds: string[] = []
    selectedAnchors &&
      selectedAnchors.forEach((anchor) => {
        if (anchor) {
          if (anchor.extent === null && imageContainer.current) {
            imageContainer.current.style.outline = 'solid 3px blue'
          }
          const anchorElement = document.getElementById(anchor.anchorId)
          if (anchorElement) {
            anchorElement.className = 'image-anchor selected'
            newSelectedAnchorIds.push(anchorElement.id)
          }
        }
      })
    setSelectedAnchorIds(newSelectedAnchorIds)
  }, [currentNode, startAnchor, selectedAnchorIds, selectedAnchors])

  /**
   * To trigger on load and when we setSelectedExtent
   */
  useEffect(() => {
    setSelectedExtent && setSelectedExtent(null)
    if (selection.current) {
      selection.current.style.left = '-50px'
      selection.current.style.top = '-50px'
      selection.current.style.width = '0px'
      selection.current.style.height = '0px'
    }
  }, [setSelectedExtent, refresh])

  useEffect(() => {
    displayImageAnchors()
  }, [selectedAnchors, currentNode, refresh, startAnchor])

  /* onSelectionPointerDown initializes the selection */
  const onSelectionPointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragging = true
    // The y location of the image top in the browser
    const imageTop = imageContainer.current?.getBoundingClientRect().top
    // The x location of the image left in the browser
    const imageLeft = imageContainer.current?.getBoundingClientRect().left

    const x = e.clientX // The x location of the pointer in the browser
    const y = e.clientY // The y location of the poitner in the browser
    xSelectionLast = e.clientX
    ySelectionLast = e.clientY
    if (selection.current && imageLeft && imageTop) {
      selection.current.style.left = String(x - imageLeft) + 'px'
      selection.current.style.top = String(y - imageTop) + 'px'
      currentLeft = x - imageLeft
      currentTop = y - imageTop
      selection.current.style.width = '0px'
      selection.current.style.height = '0px'
    }
    document.removeEventListener('pointermove', onSelectionPointerMove)
    document.addEventListener('pointermove', onSelectionPointerMove)
    document.removeEventListener('pointerup', onSelectionPointerUp)
    document.addEventListener('pointerup', onSelectionPointerUp)
  }

  /* onMove resizes the selection */
  const onSelectionPointerMove = (e: PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (dragging) {
      const x = e.clientX // The x location of the pointer in the browser
      const y = e.clientY // The y location of the poitner in the browser
      const deltaX = x - xSelectionLast // The change in the x location
      const deltaY = y - ySelectionLast // The change in the y location
      xSelectionLast = e.clientX
      ySelectionLast = e.clientY

      if (selection.current) {
        const imageTop = imageContainer.current?.getBoundingClientRect().top
        const imageLeft = imageContainer.current?.getBoundingClientRect().left
        let left = parseFloat(selection.current.style.left)
        let top = parseFloat(selection.current.style.top)
        let width = parseFloat(selection.current.style.width)
        let height = parseFloat(selection.current.style.height)

        // Horizontal dragging
        // Case A: Dragging above start point
        if (imageLeft && x - imageLeft < currentLeft) {
          width -= deltaX
          left += deltaX
          selection.current.style.left = String(left) + 'px'
          // Case B: Dragging below start point
        } else {
          width += deltaX
        }

        // Vertical dragging
        // Case A: Dragging to the left of start point
        if (imageTop && y - imageTop < currentTop) {
          height -= deltaY
          top += deltaY
          selection.current.style.top = String(top) + 'px'
          // Case B: Dragging to the right of start point
        } else {
          height += deltaY
        }

        // Update height and width
        selection.current.style.width = String(width) + 'px'
        selection.current.style.height = String(height) + 'px'
      }
    }
  }

  /**
   * onSelectionPointerUp so we have completed making our selection,
   * therefore we should create a new IImageExtent and
   * update the currently selected extent
   * @param e
   */
  const onSelectionPointerUp = (e: PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragging = false
    if (selection.current) {
      currentTop = 0
      currentLeft = 0
      const extent: IImageExtent = {
        type: 'image',
        height: parseFloat(selection.current.style.height),
        left: parseFloat(selection.current.style.left),
        top: parseFloat(selection.current.style.top),
        width: parseFloat(selection.current.style.width),
      }
      // Check if setSelectedExtent exists, if it does then update it
      if (setSelectedExtent) {
        setSelectedExtent(extent)
      }
    }
    // Remove pointer event listeners
    document.removeEventListener('pointermove', onSelectionPointerMove)
    document.removeEventListener('pointerup', onSelectionPointerUp)
  }

  const onHandleClearSelectionClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (setSelectedExtent) {
      setSelectedExtent(null)
      if (selection.current) {
        // Note: This is a rather hacky solution to hide the selected region
        selection.current.style.left = '-50px'
        selection.current.style.top = '-50px'
        selection.current.style.width = '0px'
        selection.current.style.height = '0px'
      }
    }
  }

  /* Method to return image to original size */
  const resetImageSize = () => {
    setHeightValue(currentNode.origHeight)
    setWidthValue(currentNode.origWidth)
  }

  /* Method to return image to original size */
  const saveImageVersion = async () => {
    // if there is not a prevChangeArray initialized, set it to an []
    if (!currentNode.prevChangeArray) {
      currentNode.prevChangeArray = []
    }

    // create copy node's id
    const copyNodeId = currentNode.prevChangeArray?.length + currentNode.nodeId
    console.log('copyNodeId: ' + copyNodeId)

    // get current node
    const getCurrentNodeResp = await NodeGateway.getNode(currentNode.nodeId)
    if (!getCurrentNodeResp.success) {
      failureServiceResponse('[ImageContent] node change did not update')
    }

    // create copy of node pre-update
    const copyOfCurrentNode = makeIImageNode(
      copyNodeId,
      currentNode.filePath.path,
      currentNode.origHeight,
      currentNode.origWidth,
      heightValue,
      widthValue,
      currentNode.prevChangeArray,
      currentNode.filePath.children,
      currentNode.type,
      currentNode.title,
      getCurrentNodeResp.payload?.content
    )

    console.log('prevNode height ' + heightValue)
    console.log('prevNode width ' + widthValue)

    console.log('copyOfCurrentNode height ' + copyOfCurrentNode.currHeight)
    console.log('copyOfCurrentNode width ' + copyOfCurrentNode.currWidth)

    // create a change object
    const newChangeObject = makeIChange(
      currentUser,
      new Date(),
      JSON.stringify(copyOfCurrentNode)
    )

    // unshift the change object onto the array of changes (add to the beginning)
    if (currentNode.prevChangeArray) {
      currentNode.prevChangeArray?.unshift(newChangeObject)
      // currentNode.prevChangeArray[currentNode.prevChangeArray?.length]
      // = newChangeObject
      console.log('change array length ' + currentNode.prevChangeArray.length)
      currentNode.prevChangeArray.forEach((change) => {
        console.log('change array ' + change?.prevNode?.content)
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
      failureServiceResponse('[ImageContent] node change did not update')
    }
    console.log(changeUpdateResp)
  }

  /* Method to update the height and width of the image in the INode*/
  const updateImageSizeHandler = async () => {
    // update the node content with the new current height and width
    const nodeContentHeightProperty: INodeProperty = makeINodeProperty(
      'currHeight',
      heightValue
    )
    console.log('nodeProperty ' + heightValue)
    console.log('nodeProperty value ' + nodeContentHeightProperty.value)
    const nodeContentWidthProperty: INodeProperty = makeINodeProperty(
      'currWidth',
      widthValue
    )
    console.log('nodeProperty ' + widthValue)
    console.log('nodeProperty value ' + nodeContentWidthProperty.value)
    const contentUpdateResp = await NodeGateway.updateNode(currentNode.nodeId, [
      nodeContentHeightProperty,
      nodeContentWidthProperty,
    ])
    if (!contentUpdateResp.success) {
      failureServiceResponse('[ImageContent] node content did not update')
    }
  }

  /* useEffect which updates the imageContainer's height and width */
  useEffect(() => {
    updateImageSizeHandler()
    if (imageContainer.current) {
      imageContainer.current.style.height = String(heightValue) + 'px'
      imageContainer.current.style.width = String(widthValue) + 'px'
    }
  }, [heightValue, widthValue])

  useEffect(() => {
    setHeightValue(currentNode.currHeight)
    setWidthValue(currentNode.currWidth)
  }, [currentNode])

  return (
    <div>
      <div className="image-tools">
        <div style={{ height: '100%' }}>
          <Button onClick={() => saveImageVersion()} icon={<b>Save Version</b>} />
        </div>
        <div style={{ height: '100%' }}>
          <Button onClick={() => resetImageSize()} icon={<b>Reset Size</b>} />
        </div>
        <span>
          <div className="vertical"></div>
        </span>
        <div>
          <NumberInput
            step={10}
            onChange={(valueString) => setHeightValue(Number(valueString))}
            value={heightValue}
            max={currentNode.origHeight}
            min={0}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </div>
        <div>
          <NumberInput
            step={10}
            onChange={(valueString) => setWidthValue(Number(valueString))}
            value={widthValue}
            max={currentNode.origWidth}
            min={0}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </div>
      </div>
      <div className="imageWrapper">
        <div
          ref={imageContainer}
          onPointerDown={onSelectionPointerDown}
          className="imageContainer"
        >
          <div className="image">
            {
              <div className="selection" ref={selection}>
                <div
                  onClick={onHandleClearSelectionClick}
                  onPointerDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  className="selection-close"
                >
                  <ri.RiCloseFill />
                </div>
              </div>
            }
            {imageAnchors}
            <img src={currentNode.content} />
          </div>
        </div>
      </div>
    </div>
  )
}
