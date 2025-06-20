"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebaseConfig_1 = require("./firebaseConfig");
const auth_1 = require("firebase/auth");
const loginForm = document.getElementById("login-form");
const loginButton = document.getElementById("login-button");
const loginError = document.getElementById("login-error");
if (loginForm && loginButton) {
    loginButton.addEventListener("click", (e) => __awaiter(void 0, void 0, void 0, function* () {
        e.preventDefault();
        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");
        if (!emailInput || !passwordInput || !loginError)
            return;
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        try {
            const userCredential = yield (0, auth_1.signInWithEmailAndPassword)(firebaseConfig_1.auth, email, password);
            const user = userCredential.user;
            if (user && !user.emailVerified) {
                yield (0, auth_1.sendEmailVerification)(user);
                loginError.innerText = "Please verify your email. A verification link has been sent.";
                return;
            }
            window.location.href = "home.html"; // Redirect to homepage
        }
        catch (error) {
            const errorCode = error.code;
            let errorMessage;
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
    }));
}
