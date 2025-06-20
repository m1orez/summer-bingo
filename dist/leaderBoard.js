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
const firebase_firestore_js_1 = require("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
const firebase_auth_js_1 = require("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js");
function loadLeaderboard() {
    return __awaiter(this, void 0, void 0, function* () {
        const leaderBoardDiv = document.getElementById('leaderBoard');
        const usersRef = (0, firebase_firestore_js_1.collection)(firebaseConfig_js_1.db, "users");
        const q = (0, firebase_firestore_js_1.query)(usersRef, (0, firebase_firestore_js_1.orderBy)("seashells", "desc"), (0, firebase_firestore_js_1.limit)(10));
        try {
            const querySnapshot = yield (0, firebase_firestore_js_1.getDocs)(q);
            const list = document.createElement('ul');
            querySnapshot.forEach((doc) => {
                const userData = doc.data();
                const listItem = document.createElement('li');
                listItem.textContent = `${userData.seashells} - ${userData.username || 'Unknown User'}`;
                list.appendChild(listItem);
            });
            leaderBoardDiv.appendChild(list);
        }
        catch (error) {
            console.error("Error loading leaderboard: ", error);
            leaderBoardDiv.textContent = "Failed to load leaderboard.";
        }
    });
}
function updateSeashellsDisplay(uid) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const userDoc = (0, firebase_firestore_js_1.doc)(firebaseConfig_js_1.db, "users", uid);
        try {
            const userSnap = yield (0, firebase_firestore_js_1.getDoc)(userDoc);
            if (userSnap.exists()) {
                const data = userSnap.data();
                document.getElementById("seashells").textContent = (_a = data.seashells) !== null && _a !== void 0 ? _a : 0;
            }
        }
        catch (error) {
            console.error("Error fetching seashells: ", error);
        }
    });
}
(0, firebase_auth_js_1.onAuthStateChanged)(firebaseConfig_js_1.auth, (user) => {
    if (user) {
        updateSeashellsDisplay(user.uid);
    }
    else {
        console.warn("User not logged in.");
    }
});
// Load leaderboard entries
loadLeaderboard();
