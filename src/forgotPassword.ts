import { auth } from "./firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";

const form = document.getElementById("forgotPasswordForm") as HTMLFormElement | null;

if (form) {
  form.addEventListener("submit", async (e: Event) => {
    e.preventDefault();

    const emailInput = (form.querySelector('input[name="email"]') as HTMLInputElement | null);
    const email = emailInput?.value.trim();

    if (!email) {
      alert("Please enter your email.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent! Check your inbox.");
      form.reset();
    } catch (error: any) {
      alert("Error sending password reset email: " + error.message);
    }
  });
}
