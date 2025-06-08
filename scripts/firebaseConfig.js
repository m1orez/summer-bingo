import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

export { auth, db, app};
