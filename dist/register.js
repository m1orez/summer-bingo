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
const firebaseConfig_js_1 = require("./firebaseConfig.js");
const firebase_auth_js_1 = require("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js");
const firebase_firestore_js_1 = require("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
const registerForm = document.getElementById("registerForm");
window.addEventListener('load', () => {
    const form = document.getElementById('loginForm');
    if (form)
        form.reset();
});
registerForm.addEventListener("submit", (e) => __awaiter(void 0, void 0, void 0, function* () {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    try {
        const usersRef = (0, firebase_firestore_js_1.collection)(firebaseConfig_js_1.db, "users");
        const q = (0, firebase_firestore_js_1.query)(usersRef, (0, firebase_firestore_js_1.where)("username", "==", username));
        const querySnapshot = yield (0, firebase_firestore_js_1.getDocs)(q);
        if (!querySnapshot.empty) {
            alert("Username is already taken. Please choose another one.");
            return;
        }
        const userCredential = yield (0, firebase_auth_js_1.createUserWithEmailAndPassword)(firebaseConfig_js_1.auth, email, password);
        const user = userCredential.user;
        yield (0, firebase_auth_js_1.sendEmailVerification)(user);
        yield (0, firebase_firestore_js_1.setDoc)((0, firebase_firestore_js_1.doc)(firebaseConfig_js_1.db, "users", user.uid), {
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
    }
    catch (error) {
        console.error("Registration error:", error);
        alert(error.message);
    }
}));
