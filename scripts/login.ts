import { auth } from "./firebaseConfig";
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";

const loginForm = document.getElementById("login-form") as HTMLFormElement | null;
const loginButton = document.getElementById("login-button") as HTMLButtonElement | null;
const loginError = document.getElementById("login-error") as HTMLElement | null;

if (loginForm && loginButton) {
  loginButton.addEventListener("click", async (e: Event) => {
    e.preventDefault();

    const emailInput = document.getElementById("email") as HTMLInputElement | null;
    const passwordInput = document.getElementById("password") as HTMLInputElement | null;

    if (!emailInput || !passwordInput || !loginError) return;

    const email: string = emailInput.value.trim();
    const password: string = passwordInput.value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user && !user.emailVerified) {
        await sendEmailVerification(user);
        loginError.innerText = "Please verify your email. A verification link has been sent.";
        return;
      }

      window.location.href = "home.html"; // Redirect to homepage
    } catch (error: any) {
      const errorCode: string = error.code;
      let errorMessage: string;

      switch (errorCode) {
        case "auth/user-not-found":
          errorMessage = "User not found. Please register.";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password. Try again.";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address.";
          break;
        default:
          errorMessage = "Login failed. Please try again.";
      }

      loginError.innerText = errorMessage;
    }
  });
}
