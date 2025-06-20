import { auth, db } from "./firebaseConfig";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification
} from "firebase/auth";
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";

const registerForm = document.getElementById("registerForm") as HTMLFormElement | null;

window.addEventListener('load', () => {
  const loginForm = document.getElementById('loginForm') as HTMLFormElement | null;
  if (loginForm) loginForm.reset();
});

registerForm?.addEventListener("submit", async (e: Event) => {
  e.preventDefault();

  const username = (document.getElementById("username") as HTMLInputElement).value.trim();
  const email = (document.getElementById("email") as HTMLInputElement).value.trim();
  const password = (document.getElementById("password") as HTMLInputElement).value;

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

  } catch (error: any) {
    console.error("Registration error:", error);
    alert(error.message || "An error occurred during registration.");
  }
});
