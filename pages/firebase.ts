import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage"; // Import getStorage and getApps


const firebaseConfig = {
  apiKey: "AIzaSyALCLl8LCBwIXN-DVK7WVAnFn5uG8eB77w",
  authDomain: "bdlt-ipfs.firebaseapp.com",
  projectId: "bdlt-ipfs",
  storageBucket: "bdlt-ipfs.appspot.com",
  messagingSenderId: "710240636827",
  appId: "1:710240636827:web:080beff534ad51cf531b3e",
  measurementId: "G-93805S78E3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
// const analytics = getAnalytics(app);