import {
  Alert,
  Button,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Text,
} from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { makeIUser } from '../../types'
import { UserGateway } from '../../users'
import './LoginScreen.scss'

// terrible opsec is funny, actually
// here's the .env stuff im using for firebase!
/*
baTSC_COMPILE_ON_ERROR=true
ESLINT_NO_DEV_ERRORS=true
REACT_APP_FIREBASE_API_KEY=AIzaSyATCrDuImN5ZbQF_ErRvmjLk227jfGxZDc
REACT_APP_FIREBASE_DATABASE_URL=auth-development-a7add.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=auth-development-a7add
REACT_APP_FIREBASE_STORAGE_BUCKET=auth-development-a7add.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=554267578063
REACT_APP_FIREBASE_APP_ID=1:554267578063:web:8724f5aee208d11915f1


# const firebaseConfig = {
#   apiKey: "AIzaSyATCrDuImN5ZbQF_ErRvmjLk227jfGxZDc",
#   authDomain: "auth-development-a7add.firebaseapp.com",
#   projectId: "auth-development-a7add",
#   storageBucket: "auth-development-a7add.appspot.com",
#   messagingSenderId: "554267578063",
#   appId: "1:554267578063:web:8724f5aee208d11915f1ba"
# };

*/

export interface ILoginScreenProps {
  currentUser: any
  setCurrentUser: (user: any) => void
  setIsLoggedIn: (isLoggedIn: boolean) => void
  setCurrentFirebaseUser: (user: any) => void
  currentFirebaseUser: any
  auth: any
}

export const LoginScreen = (props: ILoginScreenProps) => {
  const { currentUser, setCurrentUser, setIsLoggedIn, setCurrentFirebaseUser, auth } =
    props
  const [email, setEmail] = useState<string>()
  const [password, setPassword] = useState<string>()
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [confirmPassword, setConfirmPassword] = useState<string>()
  const [error, setError] = useState<string>('')
  const [firebaseLoading, setFirebaseLoading] = useState<boolean>(false)
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(true)
  const handleShowClick = () => setShowPassword(!showPassword)

  useEffect(() => {
    if (!isLoggingIn && password ? password.length < 6 : false) {
      setError('Password must be more than 6 characters.')
    } else if (!isLoggingIn && password ? password.length >= 6 : false) {
      setError('')
    }
  }, [password])
  useEffect(() => {
    if (confirmPassword !== password) {
      setError('Passwords do not match.')
    } else {
      setError('')
    }
  }, [confirmPassword])

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user: any) => {
      if (user) {
        console.log(JSON.stringify(user))
        setCurrentFirebaseUser(user)
        const getUserResp = await UserGateway.getUser(user.uid)
        if (getUserResp.success) {
          setCurrentUser(getUserResp.payload)
        } else {
          const internalUser = makeIUser(
            user.uid,
            user.email,
            'https://www.hollywoodreporter.com/wp-content/uploads/' +
              '2019/03/avatar-publicity_still-h_2019.jpg?w=1024',
            []
          )
          const createUserResp = await UserGateway.createUser(internalUser)
          if (createUserResp.success) {
            setCurrentUser(createUserResp.payload)
          }
        }
        setIsLoggedIn(true)
      }
    })
    return unsubscribe
  }, [])

  async function signup(email: string, password: string) {
    return auth.createUserWithEmailAndPassword(email, password)
  }

  async function login(email: string, password: string) {
    return auth.signInWithEmailAndPassword(email, password)
  }

  async function handleSubmit() {
    // console.log(JSON.stringify({ email, password, confirmPassword }))
    if (isLoggingIn) {
      try {
        setError('')
        setFirebaseLoading(true)
        await login(email ?? '', password ?? '')
      } catch (e) {
        setError('Login unsuccessful.')
      }
      setFirebaseLoading(false)
    } else {
      if (confirmPassword !== password) {
        return setError('Passwords don\'t match')
      }
      try {
        setError('')
        setFirebaseLoading(true)
        const checkIfDuplicate = await UserGateway.getUserByEmail(email ?? '')
        console.log(JSON.stringify(checkIfDuplicate))
        if (checkIfDuplicate.success) {
          return setError('A user with this email already exists.')
        } else {
          await signup(email ?? '', password ?? '')
        }
      } catch (e) {
        console.log(e)
        if (!error) {
          setError('Failed to create an account')
        }
      }
      setFirebaseLoading(false)
    }
  }

  console.log(firebaseLoading)

  // shoutout this youtube video LMAO https://www.youtube.com/watch?v=PKwu15ldZ7k
  return (
    <div className="container">
      <Text className="demo">HyperSheet Demo</Text>
      <div className="login">
        <Stack spacing={3}>
          {JSON.stringify(currentUser)}
          <Input
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            // value={email}
            isRequired
          />
          <InputGroup size="md">
            <Input
              onChange={(e) => setPassword(e.target.value)}
              // value={password}
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
          {isLoggingIn ? (
            <div>
              <Stack spacing={3}>
                <Button onClick={handleSubmit}>Log In </Button>
                <div className="login-text-container">
                  <p className="login-text">Don&apos;t have an account? </p>
                  <a
                    className="login-text login-link"
                    onClick={() => setIsLoggingIn(false)}
                  >
                    Sign Up!
                  </a>
                </div>
              </Stack>
            </div>
          ) : (
            <div>
              <Stack spacing={3}>
                <Input
                  isRequired
                  type="password"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  // value={confirmPassword}
                  placeholder="Confirm password"
                />
                <Button onClick={handleSubmit}>Sign Up </Button>
                <div className="login-text-container">
                  <p className="login-text">Already have an account? </p>
                  <a
                    className="login-text login-link"
                    onClick={() => setIsLoggingIn(true)}
                  >
                    Log In!
                  </a>
                </div>
              </Stack>
            </div>
          )}
          {error ? (
            <Alert className="alert-box">{error}</Alert>
          ) : (
            <div className="alert-box"></div>
          )}
        </Stack>
      </div>
    </div>
  )
}
