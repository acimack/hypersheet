import React from 'react'
import { Button } from '../Button'
import * as ri from 'react-icons/ri'
import * as ai from 'react-icons/ai'

import { Menu, MenuButton, MenuItem, MenuList, Portal, Text } from '@chakra-ui/react'
import { Extent, IAnchor, NodeIdsToNodesMap } from '../../types'
import { Link } from 'react-router-dom'
import './Header.scss'
import { IUser } from '../../types/IUser'

interface IHeaderProps {
  isLinking: boolean
  startAnchor: IAnchor | null
  nodeIdsToNodesMap: NodeIdsToNodesMap
  onCreateNodeButtonClick: () => void
  onHomeClick: () => void
  setIsLinking: (isLinking: boolean) => void
  setStartAnchor: (anchor: IAnchor | null) => void
  setSelectedExtent: (extent: Extent | null) => void
  currentUser: IUser | undefined
  setShowProfile: (showProfile: boolean) => void
  showProfile: boolean
  logOut: () => void
}

export const Header = ({
  onCreateNodeButtonClick,
  onHomeClick,
  isLinking = false,
  startAnchor,
  setStartAnchor,
  setIsLinking,
  showProfile,
  setShowProfile,
  setSelectedExtent,
  nodeIdsToNodesMap,

  currentUser,
  logOut,
}: IHeaderProps) => {
  const customButtonStyle = { height: 30, marginLeft: 10, width: 30 }

  const handleCancelLink = () => {
    setStartAnchor(null)
    setSelectedExtent(null)
    setIsLinking(false)
  }
  return (
    <div className={isLinking ? 'header-linking' : 'header'}>
      <div className="left-bar">
        <Link to={'/'}>
          <div className="name" onClick={onHomeClick}>
            Hyper<b>Sheet</b>
          </div>
        </Link>
        <Link to={'/'}>
          <Button
            isWhite={isLinking}
            style={customButtonStyle}
            icon={<ri.RiHome2Line />}
            onClick={onHomeClick}
          />
        </Link>
        <Button
          isWhite={isLinking}
          style={customButtonStyle}
          icon={<ai.AiOutlinePlus />}
          onClick={onCreateNodeButtonClick}
        />
      </div>
      {isLinking && startAnchor && (
        <div className="right-bar">
          <div>
            Linking from <b>{nodeIdsToNodesMap[startAnchor.nodeId].title}</b>
          </div>
          <Button
            onClick={handleCancelLink}
            isWhite
            text="Cancel"
            style={{ fontWeight: 600, height: 30, marginLeft: 20 }}
            icon={<ri.RiCloseLine />}
          />
        </div>
      )}
      <div className="right-bar">
        <Text>{currentUser ? currentUser.email : ''}</Text>
        <Menu>
          <MenuButton>
            <img className="header-prof" src={currentUser?.imgUrl} />
          </MenuButton>
          <Portal>
            <MenuList>
              <MenuItem onClick={() => setShowProfile(true)}>Edit Profile</MenuItem>
              <MenuItem onClick={logOut}>Log Out</MenuItem>
            </MenuList>
          </Portal>
        </Menu>
      </div>
    </div>
  )
}
