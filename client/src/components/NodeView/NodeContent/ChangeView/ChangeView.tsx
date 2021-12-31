import React from 'react'
import { ChangeViewItem } from './ChangeViewItem'
import './ChangeView.scss'
// import { INode } from '../../../../types'
// import { ChangeWrapper } from '../../../../types/ChangeWrapper'
import { IChange } from '../../../../types/IChange'
import { INode } from '../../../../types'

export interface IChangeViewProps {
  changeUrlOnClick?: boolean
  prevChangeArray?: IChange[]
  currentNode: INode
}

export const ChangeView = (props: IChangeViewProps) => {
  const { changeUrlOnClick = true, currentNode } = props
  const prevChangeArray = currentNode.prevChangeArray
  const toShowChanges = prevChangeArray && prevChangeArray.length > 0
  return toShowChanges ? (
    <div className="changeView-wrapper">
      {prevChangeArray?.map((change: IChange, index) => (
        <ChangeViewItem
          key={index}
          change={change}
          currentNode={currentNode}
          changeUrlOnClick={changeUrlOnClick}
        />
      ))}
    </div>
  ) : (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <p>There are no previous versions</p>
    </div>
  )
}
