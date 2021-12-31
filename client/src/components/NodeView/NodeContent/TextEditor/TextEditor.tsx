import { RemirrorEventListenerProps } from '@remirror/core'
import { EditorComponent, Remirror, useRemirror } from '@remirror/react'
import {
  BoldExtension,
  HeadingExtension,
  TextHighlightExtension,
} from 'remirror/extensions'
import { ItalicExtension } from 'remirror/extensions'
import { UnderlineExtension } from 'remirror/extensions'
import { BlockquoteExtension } from 'remirror/extensions'
import React from 'react'
import { useHistory } from 'react-router-dom'
import { LinkExtension } from 'remirror/extensions'
import 'remirror/styles/all.css'
import { fetchAnchors, fetchLinks } from '.'
import { Extent, IAnchor, INode } from '../../../../types'
import './TextEditor.scss'
import { TextEditorTools } from './TextEditorTools'
import { IUser } from '../../../../types/IUser'
interface ITextContentProps {
  // current user
  currentUser: IUser
  // for folder node content
  currentNode: INode
  // useEffect dependency for refreshing link list
  refresh: boolean
  // list of currently highlighted anchors
  selectedAnchors: IAnchor[]
  // setter for selectedAnchors
  setSelectedAnchors: (anchor: IAnchor[]) => void
  // setter for selectedExtent
  setSelectedExtent: (extent: Extent | null | undefined) => void
  // setter for selectedNode
  setSelectedNode: (node: INode) => void
  // to indicate the anchor that we are linking from
  startAnchor: IAnchor | null
}

/** The content of an text node, including all its anchors */
export const TextEditor = (props: ITextContentProps) => {
  // destructuring props array
  const {
    currentUser,
    currentNode,
    startAnchor,
    setSelectedExtent,
    refresh,
    selectedAnchors,
    setSelectedAnchors,
  } = props

  const history = useHistory()
  /* Set up the Remirror link extension such that link clicks are
  controlled by changing the default handler */
  const linkExtension = new LinkExtension({ autoLink: true })
  linkExtension.addHandler('onClick', (_, data) => {
    const href: string = data.href
    const asyncOnClick = async () => {
      const links = await fetchLinks(href)
      const anchors = await fetchAnchors(links)
      if (links.length > 0) {
        if (links[0].anchor1Id !== href) {
          history.push(`/${links[0].anchor1NodeId}/`)
        } else if (links[0].anchor2Id !== href) {
          history.push(`/${links[0].anchor2NodeId}/`)
        }
      }
      setSelectedAnchors(anchors)
    }
    asyncOnClick()
    return true
  })

  /* Setting up the Remirror manager and state */
  const { manager, state } = useRemirror({
    content: currentNode.content,
    stringHandler: 'html',
    extensions: () => [
      linkExtension,
      new BoldExtension(),
      new ItalicExtension(),
      new UnderlineExtension(),
      new HeadingExtension(),
      new TextHighlightExtension(),
      new BlockquoteExtension(),
    ],
  })

  /* Method that gets called whenever Text content is changed */
  const onTextChange = (textParams: RemirrorEventListenerProps<any>) => {
    const from = textParams.state.selection.from
    const to = textParams.state.selection.to
    const text = textParams.state.doc.textBetween(from, to)
    if (from !== to) {
      const selectedExtent: Extent = {
        type: 'text',
        startCharacter: from,
        endCharacter: to,
        text: text,
      }
      setSelectedExtent(selectedExtent)
    } else {
      setSelectedExtent(null)
    }
  }

  return (
    <div className="textEditor">
      <div className="remirror-theme">
        <Remirror manager={manager} initialContent={state} onChange={onTextChange}>
          <TextEditorTools
            currentUser={currentUser}
            currentNode={currentNode}
            selectedAnchors={selectedAnchors}
            startAnchor={startAnchor}
            refresh={refresh}
          />
          <EditorComponent />
        </Remirror>
      </div>
    </div>
  )
}
