import {
  Alert,
  Button,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Text,
  // Menu,
  // MenuButton,
  // MenuItem,
  // MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  // Portal,
  // Switch,
} from '@chakra-ui/react'
// import { stringify } from 'querystring'
import React, { useEffect, useState } from 'react'
import { IUserProperty, makeIUserProperty } from '../../types'
import { UserGateway } from '../../users'
import './Profile.scss'
// import { INodeProperty } from '../../types'
// import { deleteUser } from 'firebase/auth'
import { http } from '../../global'

// terrible opsec is funny, actually
// here's the .env stuff im using for firebase!
/*
TSC_COMPILE_ON_ERROR=true
ESLINT_NO_DEV_ERRORS=true
REACT_APP_FIREBASE_API_KEY=AIzaSyATCrDuImN5ZbQF_ErRvmjLk227jfGxZDc
REACT_APP_FIREBASE_DATABASE_URL=auth-development-a7add.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=auth-development-a7add
REACT_APP_FIREBASE_STORAGE_BUCKET=auth-development-a7add.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=554267578063
REACT_APP_FIREBASE_APP_ID=1:554267578063:web:8724f5aee208d11915f1ba

# const firebaseConfig = {
#   apiKey: "AIzaSyATCrDuImN5ZbQF_ErRvmjLk227jfGxZDc",
#   authDomain: "auth-development-a7add.firebaseapp.com",
#   projectId: "auth-development-a7add",
#   storageBucket: "auth-development-a7add.appspot.com",
#   messagingSenderId: "554267578063",
#   appId: "1:554267578063:web:8724f5aee208d11915f1ba"
# };

*/

export interface IProfileProps {
  currentUser: any
  setIsOpen: (isLoggedIn: boolean) => void
  isOpen: boolean
  onClose: () => void
  setCurrentUser: (user: any) => void
  currentFirebaseUser: any
  setCurrentFirebaseUser: (user: any) => void
  setIsLoggedIn: (isLoggedIn: boolean) => void
  auth: any
}

// test profile image URL: https://i.imgur.com/yNcJ7KH.jpeg

export const Profile = (props: IProfileProps) => {
  const {
    isOpen,
    onClose,
    currentUser,
    currentFirebaseUser,
    setCurrentUser,
    setIsOpen,
    // auth,
    // setIsLoggedIn,
  } = props

  const [email, setEmail] = useState<string>(currentUser ? currentUser.email : '')
  const [password, setPassword] = useState<string>()
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [confirmPassword, setConfirmPassword] = useState<string>()
  // const [changedNodes, setChangedNodes] = useState<[]>(
  //   currentUser ? currentUser.homeNodeId : ''
  // )
  // const [imgUploading, setImgUploading] = useState(false)
  // const profModalRef = React.createRef()
  const [imageStatus, setImageStatus] = useState('')
  const [imgUrl, setImgUrl] = useState<string>(currentUser ? currentUser.imgUrl : '')
  const [error, setError] = useState<string>(' ')
  const [useWebImage, setUseWebImage] = useState(false)
  const handleShowClick = () => setShowPassword(!showPassword)
  const [modalImage, setModalImage] = useState(
    <img
      className="profile-image-modal"
      key="first"
      src={currentUser ? currentUser.imgUrl : ''}
    ></img>
  )

  async function handleUpdate() {
    if (confirmPassword !== password) {
      return setError('Passwords don\'t match')
    }
    if (password ? password.length < 4 : false) {
      return setError('Password too short.')
    }
    const properties: IUserProperty[] = []
    if (imgUrl != currentUser.imgUrl) {
      properties.push(makeIUserProperty('imgUrl', imgUrl))
    }
    if (email != currentUser.email) {
      properties.push(makeIUserProperty('email', email))
      currentFirebaseUser.updateEmail(email)
    }
    if (password) {
      currentFirebaseUser.updatePassword(password)
    }
    const updateResp = await UserGateway.updateUser(currentUser.userId, properties)
    if (!updateResp.success) {
      setError('Did not update successfully')
      return
    }
    setCurrentUser(updateResp.payload)
  }

  useEffect(() => {
    setImageStatus('')
  }, [useWebImage])
  const handleClose = () => {
    onClose()
  }

  function handleImageModalUpdate() {
    setIsOpen(false)
    handleUpdate()
  }

  // async function deleteAccount() {
  //   deleteUser(currentFirebaseUser)
  //     .then(() => {
  //       // User deleted
  //     })
  //     .catch((e: any) => {
  //       setError(e)
  //     })
  //   const deleteResp = await UserGateway.deleteUser(currentUser.userId)
  //   if (!deleteResp.success) {
  //     setError('Couldn\'t delete')
  //   }
  //   console.log(JSON.stringify(deleteResp))

  //   setCurrentUser(null)
  //   setIsLoggedIn(false)
  // }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setImageStatus('Image uploading...')
    const files = event.target.files
    const link = files && files[0] && (await uploadImage(files[0]))
    link && setImgUrl(link)
    setImageStatus('Image uploaded!')
  }

  useEffect(() => {
    setModalImage(
      <img className="profile-image-modal" key={currentUser.imgUrl} src={imgUrl}></img>
    )
  }, [imgUrl])

  useEffect(() => {
    if (password ? password.length < 6 : false) {
      setError('Password too short.')
    } else {
      setError('')
    }
  }, [password])

  useEffect(() => {
    if (password != confirmPassword) {
      setError('Passwords do not match.')
    } else {
      setError('')
    }
  }, [confirmPassword])

  const handleImageContentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImgUrl(event.target.value)
  }

  const uploadImage = async (file: any): Promise<string> => {
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

  useEffect(() => {
    console.log(imgUrl)
  }, [imgUrl])

  return (
    <div className="loading">
      <Stack spacing={3}>
        {JSON.stringify(currentUser)}
        <img
          className="profile-image"
          src={currentUser.imgUrl}
          onClick={() => setIsOpen(true)}
        ></img>
        <Modal isOpen={isOpen} onClose={handleClose}>
          <div>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Change profile photo</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <br />
                <Stack spacing={3}>
                  {modalImage}
                  {/* <Text font-weight="800">Image URL</Text> */}
                  <br />
                  {/* <Switch
                    checked={useWebImage}
                    onChange={(e) => setUseWebImage(!useWebImage)}
                  ></Switch> */}
                  {useWebImage ? (
                    <div>
                      <div className="web-file-container">
                        <p className="web-file-item">Or, use an image,</p>
                        <a
                          className="web-file-item web-file-link"
                          onClick={() => setUseWebImage(false)}
                        >
                          from your computer.
                        </a>
                      </div>
                      <div className="modal-input image-upload">
                        <Input
                          value={imgUrl}
                          onChange={handleImageContentChange}
                          placeholder="Image URL..."
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="web-file-container">
                        <p className="web-file-item">Or, use an image,</p>
                        <a
                          className="web-file-item web-file-link"
                          onClick={() => setUseWebImage(true)}
                        >
                          from the web.
                        </a>
                      </div>
                      <div className="modal-input image-upload">
                        <input
                          type="file"
                          onChange={handleImageUpload}
                          placeholder="Image URL..."
                        />
                      </div>
                    </div>
                  )}
                  <Button className="profile-update" onClick={handleImageModalUpdate}>
                    Update Profile
                  </Button>
                  <Alert
                    style={
                      imageStatus
                        ? { backgroundColor: '#bee3f8' }
                        : { backgroundColor: 'white' }
                    }
                  >
                    {imageStatus}&nbsp;
                  </Alert>
                  <br />
                </Stack>
              </ModalBody>
            </ModalContent>
          </div>
        </Modal>{' '}
        <Text>Email</Text>
        <Input
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          value={email}
          isRequired
        />
        <Text>Change Password</Text>
        <InputGroup size="md">
          <Input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            isRequired
            pr="4.5rem"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter password"
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleShowClick}>
              {showPassword ? 'Hide' : 'Show'}
            </Button>
          </InputRightElement>
        </InputGroup>
        <Input
          isRequired
          type="password"
          onChange={(e) => setConfirmPassword(e.target.value)}
          value={confirmPassword}
          placeholder="Confirm password"
        />
        {/* <Input type="text" value={imgUrl} onChange={(e) =>
           setImgUrl(e.target.value)} /> */}
        <Button onClick={handleUpdate}>Save Changes</Button>
        {/* <Button className="danger" onClick={deleteAccount}>
          Delete Account
        </Button> */}
        <Alert
          style={error ? { backgroundColor: '#bee3f8' } : { backgroundColor: 'white' }}
        >
          {error}&nbsp;
        </Alert>
      </Stack>
    </div>
  )
}
