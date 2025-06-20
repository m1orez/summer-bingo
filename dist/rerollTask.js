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
const confirmBtn = document.getElementById('confirmBtn');
const warningEl = document.getElementById('warning');
const seashellsEl = document.getElementById('seashells');
let currentTasks = [];
let skippedTasks = [];
let tasksCompleted = [];
let interests = [];
let taskIndex = null;
let userDocRef = null;
(0, firebase_auth_js_1.onAuthStateChanged)(firebaseConfig_js_1.auth, (user) => __awaiter(void 0, void 0, void 0, function* () {
    if (!user) {
        window.location.href = '../index.html';
        return;
    }
    userDocRef = (0, firebase_firestore_js_1.doc)(firebaseConfig_js_1.db, 'users', user.uid);
    const userSnap = yield (0, firebase_firestore_js_1.getDoc)(userDocRef);
    if (!userSnap.exists()) {
        window.location.href = '../index.html';
        return;
    }
    const userData = userSnap.data();
    seashellsEl.textContent = userData.seashells || 0;
    currentTasks = userData.currentTasks || [];
    skippedTasks = userData.skippedTasks || [];
    tasksCompleted = userData.tasksCompleted || [];
    interests = userData.interests || [];
    taskIndex = parseInt(new URLSearchParams(window.location.search).get('taskIndex'));
    const currentTask = currentTasks[taskIndex];
    document.getElementById("taskName").textContent = (currentTask === null || currentTask === void 0 ? void 0 : currentTask.name) || "Task not found";
    document.getElementById("taskDescription").textContent = (currentTask === null || currentTask === void 0 ? void 0 : currentTask.description) || "";
    if (!currentTask) {
        confirmBtn.disabled = true;
        warningEl.textContent = "Task not found.";
        return;
    }
    if ((userData.seashells || 0) < 5) {
        confirmBtn.disabled = true;
        warningEl.textContent = "You do not have enough seashells to reroll this task";
    }
}));
confirmBtn.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
    confirmBtn.disabled = true;
    warningEl.textContent = '';
    const userSnap = yield (0, firebase_firestore_js_1.getDoc)(userDocRef);
    const userData = userSnap.data();
    if ((userData.seashells || 0) < 5) {
        warningEl.textContent = "You do not have enough seashells to reroll this task";
        confirmBtn.disabled = true;
        return;
    }
    let response = yield fetch('../tasks.json');
    let allTasks = yield response.json();
    let pool = [];
    interests.forEach(interest => {
        if (allTasks[interest]) {
            pool = pool.concat(allTasks[interest]);
        }
    });
    let excludedTasks = new Set([
        ...currentTasks.map(t => t.name),
        ...skippedTasks.map(t => t.name),
        ...tasksCompleted.map(t => t.name)
    ]);
    let validTasks = pool.filter(t => !excludedTasks.has(t.name));
    if (validTasks.length === 0) {
        warningEl.textContent = "No new tasks available to reroll.";
        confirmBtn.disabled = false;
        return;
    }
    const newTask = validTasks[Math.floor(Math.random() * validTasks.length)];
    const oldTask = currentTasks[taskIndex];
    skippedTasks.push(oldTask);
    currentTasks[taskIndex] = newTask;
    try {
        yield (0, firebase_firestore_js_1.updateDoc)(userDocRef, {
            currentTasks: currentTasks,
            skippedTasks: skippedTasks,
            seashells: userData.seashells - 5
        });
        window.location.href = './tasks.html';
    }
    catch (error) {
        warningEl.textContent = "Failed to reroll task. Please try again.";
        confirmBtn.disabled = false;
    }
}));
