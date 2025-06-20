"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = exports.db = exports.auth = void 0;
const firebase_app_js_1 = require("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js");
const firebase_auth_js_1 = require("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js");
const firebase_firestore_js_1 = require("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
const firebaseConfig = {
    apiKey: "AIzaSyB4qMrwLBSIZXQHUN4vXYMnOxp5Iq9R_cU",
    authDomain: "summer-bingo.firebaseapp.com",
    projectId: "summer-bingo",
    storageBucket: "summer-bingo.appspot.com",
    messagingSenderId: "985343666102",
    appId: "1:985343666102:web:f78d2d8b5965a23a8c4317"
};
const app = (0, firebase_app_js_1.initializeApp)(firebaseConfig);
exports.app = app;
const auth = (0, firebase_auth_js_1.getAuth)(app);
exports.auth = auth;
const db = (0, firebase_firestore_js_1.getFirestore)(app);
exports.db = db;
