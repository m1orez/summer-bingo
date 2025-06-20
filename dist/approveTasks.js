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
const feedWrapper = document.querySelector(".proof-feed");
let currentUser = null;
let currentUserData = null;
function fetchAllProofsAndUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        const usersCol = (0, firebase_firestore_js_1.collection)(firebaseConfig_js_1.db, "users");
        const usersSnap = yield (0, firebase_firestore_js_1.getDocs)(usersCol);
        let allProofs = [];
        let usersMap = {};
        for (const userDoc of usersSnap.docs) {
            const data = userDoc.data();
            usersMap[userDoc.id] = data.username || userDoc.id;
            if (Array.isArray(data.taskProof)) {
                data.taskProof.forEach(proof => {
                    var _a;
                    allProofs.push(Object.assign(Object.assign({}, proof), { userId: userDoc.id, uploadedAt: ((_a = proof.uploadedAt) === null || _a === void 0 ? void 0 : _a.seconds) || 0 }));
                });
            }
        }
        allProofs.sort((a, b) => (a.approvedIndex || 0) - (b.approvedIndex || 0));
        return { allProofs, usersMap };
    });
}
function renderProofs(proofs, usersMap) {
    feedWrapper.innerHTML = "";
    if (proofs.length === 0) {
        feedWrapper.textContent = "No task proofs submitted yet.";
        return;
    }
    proofs.forEach(proof => {
        var _a;
        const { taskName, taskDescription, taskPoints, imageUrl, approvedIndex = 0, denyIndex = 0, userId } = proof;
        const username = usersMap[userId] || userId;
        const canVote = currentUser && currentUser.uid !== userId && !((_a = proof.voters) === null || _a === void 0 ? void 0 : _a.includes(currentUser.uid));
        const proofCard = document.createElement("div");
        proofCard.className = "proof-card";
        proofCard.innerHTML = `
      <img src="${imageUrl}" alt="Proof image" class="proof-image" />
      <div class="proof-info">
        <h3>${taskName || "Unnamed Task"}</h3>
        <p>${taskDescription || "No description provided."}</p>
        <p>Points: ${taskPoints || 0}</p>
        <p>👍 ${approvedIndex} &nbsp;&nbsp; 👎 ${denyIndex}</p>
      </div>
      <div class="proof-actions">
        <button class="thumbs-up" ${canVote ? "" : "disabled"}>👍</button>
        <button class="thumbs-down" ${canVote ? "" : "disabled"}>👎</button>
      </div>
      <p class="proof-submitter">Submitted by: ${userId === currentUser.uid ? "You" : username}</p>
    `;
        const upBtn = proofCard.querySelector(".thumbs-up");
        const downBtn = proofCard.querySelector(".thumbs-down");
        if (canVote) {
            upBtn.addEventListener("click", () => handleVote(proof, 1));
            downBtn.addEventListener("click", () => handleVote(proof, -1));
        }
        feedWrapper.appendChild(proofCard);
    });
}
function generateNewTask(interests, currentTasks, completedTasks) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch("../tasks.json");
        const allTasks = yield response.json();
        const completedNames = new Set(completedTasks.map(t => t.taskName));
        const currentNames = new Set(currentTasks.map(t => t.name));
        const seen = new Set([...completedNames, ...currentNames]);
        let potentialTasks = [];
        for (const interest of interests) {
            const categoryTasks = allTasks[interest] || [];
            for (const task of categoryTasks) {
                if (!seen.has(task.name)) {
                    potentialTasks.push(task);
                }
            }
        }
        if (potentialTasks.length === 0)
            return null;
        const newTask = potentialTasks[Math.floor(Math.random() * potentialTasks.length)];
        return newTask;
    });
}
function handleVote(proof, vote) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (!currentUser)
            return alert("You must be logged in to vote.");
        if (currentUser.uid === proof.userId)
            return alert("You cannot vote on your own proof.");
        if (proof.voters && proof.voters.includes(currentUser.uid))
            return alert("You have already voted on this proof.");
        const proofOwnerRef = (0, firebase_firestore_js_1.doc)(firebaseConfig_js_1.db, "users", proof.userId);
        try {
            const ownerSnap = yield (0, firebase_firestore_js_1.getDoc)(proofOwnerRef);
            if (!ownerSnap.exists())
                throw new Error("Proof owner data not found.");
            const ownerData = ownerSnap.data();
            const proofs = ownerData.taskProof || [];
            const proofIndex = proofs.findIndex(p => p.imageUrl === proof.imageUrl &&
                p.taskName === proof.taskName &&
                p.taskDescription === proof.taskDescription &&
                p.taskPoints === proof.taskPoints);
            if (proofIndex === -1)
                throw new Error("Proof not found in owner's data.");
            let updatedProof = Object.assign({}, proofs[proofIndex]);
            updatedProof.approvedIndex = updatedProof.approvedIndex || 0;
            updatedProof.denyIndex = updatedProof.denyIndex || 0;
            updatedProof.voters = updatedProof.voters || [];
            if (vote === 1)
                updatedProof.approvedIndex++;
            else if (vote === -1)
                updatedProof.denyIndex++;
            updatedProof.voters.push(currentUser.uid);
            proofs[proofIndex] = updatedProof;
            let updateData = { taskProof: proofs };
            if (updatedProof.approvedIndex >= 2) {
                const completedTaskExists = (_a = ownerData.tasksCompleted) === null || _a === void 0 ? void 0 : _a.some(t => t.taskName === updatedProof.taskName && t.imageUrl === updatedProof.imageUrl);
                if (!completedTaskExists) {
                    const newCompleted = ownerData.tasksCompleted ? [...ownerData.tasksCompleted] : [];
                    newCompleted.push({
                        taskName: updatedProof.taskName,
                        taskDescription: updatedProof.taskDescription,
                        taskPoints: updatedProof.taskPoints,
                        imageUrl: updatedProof.imageUrl
                    });
                    const currentTasks = ownerData.currentTasks || [];
                    const completedTasks = newCompleted;
                    const indexToReplace = currentTasks.findIndex(t => t.name === updatedProof.taskName);
                    let newTask = null;
                    if (ownerData.interests) {
                        newTask = yield generateNewTask(ownerData.interests, currentTasks, completedTasks);
                    }
                    if (newTask && indexToReplace !== -1) {
                        currentTasks[indexToReplace] = newTask;
                    }
                    updateData.tasksCompleted = newCompleted;
                    updateData.seashells = (ownerData.seashells || 0) + (updatedProof.taskPoints || 0);
                    updateData.currentTasks = currentTasks;
                }
            }
            if (updatedProof.denyIndex >= 2) {
                proofs.splice(proofIndex, 1);
                updateData.taskProof = proofs;
            }
            yield (0, firebase_firestore_js_1.updateDoc)(proofOwnerRef, updateData);
            alert("Vote recorded!");
            loadAndRenderProofs();
        }
        catch (err) {
            alert("Failed to record vote: " + err.message);
        }
    });
}
function loadAndRenderProofs() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { allProofs, usersMap } = yield fetchAllProofsAndUsers();
            renderProofs(allProofs, usersMap);
        }
        catch (err) {
            feedWrapper.textContent = "Failed to load proof.";
        }
    });
}
(0, firebase_auth_js_1.onAuthStateChanged)(firebaseConfig_js_1.auth, (user) => __awaiter(void 0, void 0, void 0, function* () {
    if (!user) {
        window.location.href = "../index.html";
        return;
    }
    currentUser = user;
    const userRef = (0, firebase_firestore_js_1.doc)(firebaseConfig_js_1.db, "users", user.uid);
    const userSnap = yield (0, firebase_firestore_js_1.getDoc)(userRef);
    if (userSnap.exists()) {
        currentUserData = userSnap.data();
    }
    loadAndRenderProofs();
}));
