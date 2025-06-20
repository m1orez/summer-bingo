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
const firebase_auth_js_1 = require("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js");
const firebase_firestore_js_1 = require("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
const firebaseConfig_js_1 = require("./firebaseConfig.js");
(0, firebase_auth_js_1.onAuthStateChanged)(firebaseConfig_js_1.auth, (user) => __awaiter(void 0, void 0, void 0, function* () {
    if (user) {
        // Do NOT check emailVerified here — allow user to pick interests even if not verified
        const userRef = (0, firebase_firestore_js_1.doc)(firebaseConfig_js_1.db, "users", user.uid);
        const userSnap = yield (0, firebase_firestore_js_1.getDoc)(userRef);
        if (userSnap.exists()) {
            const data = userSnap.data();
            if (data.interests && data.interests.length > 0) {
                window.location.href = "tasks.html";
            }
        }
    }
    else {
        window.location.href = "../index.html";
    }
}));
const cards = document.querySelectorAll('.interestCard');
const selectButton = document.querySelector('button');
let selectedCards = [];
cards.forEach(card => {
    card.addEventListener('click', () => {
        const id = card.id;
        if (selectedCards.includes(id)) {
            selectedCards = selectedCards.filter(item => item !== id);
            card.classList.remove('selected');
        }
        else {
            selectedCards.push(id);
            card.classList.add('selected');
        }
    });
});
selectButton.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (selectedCards.length < 3) {
        alert("Select at least 3 categories.");
        return;
    }
    const user = firebaseConfig_js_1.auth.currentUser;
    if (!user)
        return alert("Not logged in");
    const userRef = (0, firebase_firestore_js_1.doc)(firebaseConfig_js_1.db, "users", user.uid);
    const userSnap = yield (0, firebase_firestore_js_1.getDoc)(userRef);
    if (userSnap.exists() && ((_a = userSnap.data().interests) === null || _a === void 0 ? void 0 : _a.length) > 0) {
        alert("You've already selected your interests.");
        window.location.href = "tasks.html";
        return;
    }
    yield (0, firebase_firestore_js_1.updateDoc)(userRef, {
        interests: selectedCards
    });
    window.location.href = "tasks.html";
}));
