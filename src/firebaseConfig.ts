import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB4qMrwLBSIZXQHUN4vXYMnOxp5Iq9R_cU",
  authDomain: "summer-bingo.firebaseapp.com",
  projectId: "summer-bingo",
  storageBucket: "summer-bingo.appspot.com",
  messagingSenderId: "985343666102",
  appId: "1:985343666102:web:f78d2d8b5965a23a8c4317"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, app };
