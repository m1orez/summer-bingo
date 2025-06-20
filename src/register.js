import { auth, db } from "./firebaseConfig.js";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const registerForm = document.getElementById("registerForm");

window.addEventListener('load', () => {
  const form = document.getElementById('loginForm');
  if (form) form.reset();
});

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      alert("Username is already taken. Please choose another one.");
      return;
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await sendEmailVerification(user);

    await setDoc(doc(db, "users", user.uid), {
      username,
      email,
      seashells: 50,
      interests: [],
      tasksCompleted: [],
      currentTasks: [],
      skippedTasks: [],
      taskProof: []
    });

    alert("Account created! A verification email has been sent. You can now pick your interests.");
    window.location.href = "pickInterests.html";

  } catch (error) {
    console.error("Registration error:", error);
    alert(error.message);
  }
});
