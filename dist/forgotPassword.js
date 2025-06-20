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
// forgotPassword.js
const firebaseConfig_js_1 = require("./firebaseConfig.js");
const firebase_auth_js_1 = require("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js");
const form = document.getElementById("forgotPasswordForm");
form.addEventListener("submit", (e) => __awaiter(void 0, void 0, void 0, function* () {
    e.preventDefault();
    const email = form.email.value.trim();
    if (!email) {
        alert("Please enter your email.");
        return;
    }
    try {
        yield (0, firebase_auth_js_1.sendPasswordResetEmail)(firebaseConfig_js_1.auth, email);
        alert("Password reset email sent! Check your inbox.");
        form.reset();
    }
    catch (error) {
        alert("Error sending password reset email: " + error.message);
    }
}));
