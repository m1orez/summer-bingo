import { auth } from "./firebaseConfig";
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";

const loginForm = document.getElementById("loginForm") as HTMLFormElement | null;
const loginError = document.getElementById("login-error") as HTMLElement | null;

if (!loginForm) {
  console.error("Login form not found!");
} else {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Login form submitted");

    const emailInput = document.getElementById("email") as HTMLInputElement | null;
    const passwordInput = document.getElementById("password") as HTMLInputElement | null;

    if (!emailInput || !passwordInput) {
      console.error("Email or password input not found");
      return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (loginError) loginError.innerText = "";

    try {
      console.log(`Attempting login with email: ${email}`);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("Login success:", user);

      if (user && !user.emailVerified) {
        console.log("User email not verified, sending verification email");
        await sendEmailVerification(user);
        if (loginError) loginError.innerText = "Please verify your email. Verification link sent.";
        return;
      }

      window.location.href = "../pages/tasks.html";
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = "Login failed. Please try again.";

      if (error.code) {
        switch (error.code) {
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
            errorMessage = error.message || errorMessage;
        }
      }

      if (loginError) loginError.innerText = errorMessage;
    }
  });
}
