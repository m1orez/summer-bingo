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
const CLOUD_NAME = "dqlfuyrwg";
const UPLOAD_PRESET = "pondsummerbingo";
const taskTitle = document.getElementById("task-title");
const taskDesc = document.getElementById("task-desc");
const form = document.getElementById("proofForm");
const urlParams = new URLSearchParams(window.location.search);
const taskIndexRaw = urlParams.get("taskIndex");
const taskIndex = taskIndexRaw !== null && !isNaN(parseInt(taskIndexRaw)) ? parseInt(taskIndexRaw) : 0;
(0, firebase_auth_js_1.onAuthStateChanged)(firebaseConfig_js_1.auth, (user) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!user) {
        console.warn("User not signed in. Redirecting...");
        window.location.href = "../index.html";
        return;
    }
    try {
        const userRef = (0, firebase_firestore_js_1.doc)(firebaseConfig_js_1.db, "users", user.uid);
        const userSnap = yield (0, firebase_firestore_js_1.getDoc)(userRef);
        const userData = userSnap.data();
        const task = (_a = userData === null || userData === void 0 ? void 0 : userData.currentTasks) === null || _a === void 0 ? void 0 : _a[taskIndex];
        if (task) {
            taskTitle.textContent = task.name || "Submit Proof";
            taskDesc.textContent = task.description || "No description provided.";
        }
        else {
            taskTitle.textContent = "Task not found";
            taskDesc.textContent = "This task does not exist.";
        }
        form.addEventListener("submit", (e) => __awaiter(void 0, void 0, void 0, function* () {
            e.preventDefault();
            const fileInput = document.getElementById("proofImage");
            const file = fileInput.files[0];
            if (!file) {
                alert("Please select an image to upload.");
                return;
            }
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", UPLOAD_PRESET);
            try {
                const res = yield fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
                    method: "POST",
                    body: formData,
                });
                const data = yield res.json();
                if (!data.secure_url) {
                    throw new Error("Cloudinary did not return a secure_url");
                }
                const imageUrl = data.secure_url;
                const proofObject = {
                    taskIndex,
                    taskName: task.name || "Unknown Task",
                    taskDescription: task.description || "No description provided.",
                    taskPoints: task.points || 0,
                    approvedIndex: 0,
                    denyIndex: 0,
                    imageUrl,
                };
                yield (0, firebase_firestore_js_1.updateDoc)(userRef, {
                    taskProof: (0, firebase_firestore_js_1.arrayUnion)(proofObject)
                });
                alert("Proof uploaded and saved!");
                window.location.href = "./tasks.html";
            }
            catch (uploadError) {
                console.error("Upload or Firestore error:", uploadError);
                alert("Failed to upload or save proof. Check console for details.");
            }
        }));
    }
    catch (fetchError) {
        console.error("Failed to load user data:", fetchError);
        alert("Error loading task data. Please try again.");
    }
}));
