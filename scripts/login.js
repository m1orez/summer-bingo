import { auth, db } from "./firebaseConfig.js";
import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const loginForm = document.querySelector("form");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const loginInput = e.target.email.value.trim(); // now only email field
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
