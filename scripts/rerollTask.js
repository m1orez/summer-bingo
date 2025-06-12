import { db, auth } from './firebaseConfig.js';
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const confirmBtn = document.getElementById('confirmBtn');
const warningEl = document.getElementById('warning');
const seashellsEl = document.getElementById('seashells');

let currentTasks = [];
let skippedTasks = [];
let tasksCompleted = [];
let interests = [];
let taskIndex = null;
let userDocRef = null;

onAuthStateChanged(auth, async user => {
  if (!user) {
    window.location.href = '../index.html';
    return;
  }

  userDocRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userDocRef);

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
  document.getElementById("taskName").textContent = currentTask?.name || "Task not found";
  document.getElementById("taskDescription").textContent = currentTask?.description || "";

  if (!currentTask) {
    confirmBtn.disabled = true;
    warningEl.textContent = "Task not found.";
    return;
  }

  if ((userData.seashells || 0) < 5) {
    confirmBtn.disabled = true;
    warningEl.textContent = "You do not have enough seashells to reroll this task";
  }
});

confirmBtn.addEventListener('click', async () => {
  confirmBtn.disabled = true;
  warningEl.textContent = '';

  const userSnap = await getDoc(userDocRef);
  const userData = userSnap.data();

  if ((userData.seashells || 0) < 5) {
    warningEl.textContent = "You do not have enough seashells to reroll this task";
    confirmBtn.disabled = true;
    return;
  }

  let response = await fetch('../tasks.json');
  let allTasks = await response.json();

  let pool = [];
  interests.forEach(interest => {
    if (allTasks[interest]) {
      pool = pool.concat(allTasks[interest]);
    }
  });

  // Filter out tasks that are already current, skipped, or completed
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

  // Pick a random new task
  const newTask = validTasks[Math.floor(Math.random() * validTasks.length)];

  // Add the old task to skippedTasks
  const oldTask = currentTasks[taskIndex];
  skippedTasks.push(oldTask);

  // Replace the task at taskIndex with the new one
  currentTasks[taskIndex] = newTask;

  try {
    await updateDoc(userDocRef, {
      currentTasks: currentTasks,
      skippedTasks: skippedTasks,
      seashells: userData.seashells - 5
    });
    window.location.href = './tasks.html';
  } catch (error) {
    warningEl.textContent = "Failed to reroll task. Please try again.";
    confirmBtn.disabled = false;
  }
});
