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
const firebase_auth_js_2 = require("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js");
(0, firebase_auth_js_1.onAuthStateChanged)(firebaseConfig_js_1.auth, (user) => __awaiter(void 0, void 0, void 0, function* () {
    if (user) {
        const userRef = (0, firebase_firestore_js_1.doc)(firebaseConfig_js_1.db, "users", user.uid);
        const userSnap = yield (0, firebase_firestore_js_1.getDoc)(userRef);
        if (!userSnap.exists())
            return;
        const userData = userSnap.data();
        const seashellDisplay = document.getElementById("seashells");
        if (seashellDisplay) {
            seashellDisplay.textContent = userData.seashells || 0;
        }
        const navGreeting = document.getElementById("navGreeting");
        if (navGreeting) {
            const displayName = user.displayName;
            if (displayName) {
                navGreeting.textContent = `Hello, ${displayName}`;
            }
            else if (userData.username) {
                navGreeting.textContent = `Hello, ${userData.username}`;
            }
            else {
                navGreeting.textContent = `Hello, ${user.email}`;
            }
        }
    }
}));
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield (0, firebase_auth_js_2.signOut)(firebaseConfig_js_1.auth);
            window.location.href = "../index.html";
        }
        catch (error) {
            console.error("Logout error:", error);
            alert("Error logging out. Please try again.");
        }
    }));
}
