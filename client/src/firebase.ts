import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'

// const app = firebase.initializeApp({
//   apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
//   authDomain: process.env.REACT_APP_FIREBASE_DATABASE_URL,
//   projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.REACT_APP_FIREBASE_APP_ID,
// })

// export default app

const firebaseConfig = {
  apiKey: 'AIzaSyATCrDuImN5ZbQF_ErRvmjLk227jfGxZDc',
  authDomain: 'auth-development-a7add.firebaseapp.com',
  projectId: 'auth-development-a7add',
  storageBucket: 'auth-development-a7add.appspot.com',
  messagingSenderId: '554267578063',
  appId: '1:554267578063:web:8724f5aee208d11915f1ba',
}

const app = firebase.initializeApp(firebaseConfig)

// Initialize Firebase
export default app
export const auth = app.auth()
