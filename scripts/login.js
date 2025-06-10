import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Firebase config
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

const loginForm = document.getElementById("loginForm");
const forgotPasswordLink = document.getElementById("forgotPassword");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const loginInput = e.target.email.value.trim();
  const password = e.target.password.value;

  try {
    let emailToLogin = loginInput;

    if (!loginInput.includes("@")) {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", loginInput));
      const snapshot = await getDocs(q);

      if (snapshot.empty) throw new Error("Username not found");

      emailToLogin = snapshot.docs[0].data().email;
    }

    const userCredential = await signInWithEmailAndPassword(auth, emailToLogin, password);
    const uid = userCredential.user.uid;

    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();

    if (userData?.interests?.length > 0) {
      window.location.href = "./pages/tasks.html";
    } else {
      window.location.href = "./pages/pickInterests.html";
    }

  } catch (err) {
    alert("Login failed: " + err.message);
  }
});

forgotPasswordLink.addEventListener("click", async () => {
  const email = prompt("Enter your email address to reset your password:");
  if (!email) return;

  try {
    await sendPasswordResetEmail(auth, email);
    alert("Password reset email sent!");
  } catch (err) {
    alert("Error: " + err.message);
  }
});
