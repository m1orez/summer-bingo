import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc,
  getDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { auth, db } from "./firebaseConfig.js";

let currentTasks = [];
let currentTaskProof = [];

const unlockTime = new Date("2025-06-10T01:30:00+02:00");

function showCountdown() {
  const wrapper = document.querySelector(".tasks-wrapper");
  if (!wrapper) return;

  wrapper.innerHTML = "<div class='countdown'></div>";
  const countdownEl = document.querySelector(".countdown");

  function updateCountdown() {
    const now = new Date();
    const diff = unlockTime - now;

    if (diff <= 0) {
      location.reload();
    } else {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      countdownEl.textContent = `Tasks unlock in ${hours}h ${minutes}m ${seconds}s`;
    }
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

function initTaskPage() {
  const now = new Date();
  if (now >= unlockTime) {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (!user.emailVerified) {
          alert("You must verify your email before playing.");
          return;
        }

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();

          if (!userData.interests || userData.interests.length === 0) {
            showInterestPopup();
          } else {
            const allTasks = await fetchAllTasks();
            const completedNames = new Set((userData.tasksCompleted || []).map(t => t.taskName));
            const usedNames = new Set([...completedNames]);

            if (userData.currentTasks && userData.currentTasks.length > 0) {
              currentTasks = userData.currentTasks;

              for (let i = 0; i < currentTasks.length; i++) {
                const task = currentTasks[i];
                if (completedNames.has(task.name)) {
                  const replacement = await findReplacementTask(allTasks, userData.interests, usedNames);
                  if (replacement) {
                    currentTasks[i] = replacement;
                    usedNames.add(replacement.name);
                  }
                } else {
                  usedNames.add(task.name);
                }
              }

              await updateDoc(userRef, { currentTasks });
            } else {
              currentTasks = await generateAndSaveTasks(userRef, userData.interests);
            }

            currentTaskProof = userData.taskProof || [];
            renderTasks(currentTasks, currentTaskProof);
          }
        }
      } else {
        window.location.href = "../index.html";
      }
    });
  } else {
    showCountdown();
  }
}

async function fetchAllTasks() {
  const response = await fetch("../tasks.json");
  return await response.json();
}

async function findReplacementTask(allTasks, interests, excludeSet) {
  const pool = [];

  for (const interest of interests) {
    const tasks = allTasks[interest] || [];
    for (const task of tasks) {
      if (!excludeSet.has(task.name)) {
        pool.push(task);
      }
    }
  }

  if (pool.length === 0) return null;

  return pool[Math.floor(Math.random() * pool.length)];
}

async function generateAndSaveTasks(userRef, interests) {
  const allTasks = await fetchAllTasks();
  const selected = selectTasksFromInterests(allTasks, interests, 10);
  await updateDoc(userRef, { currentTasks: selected });
  return selected;
}

function selectTasksFromInterests(allTasks, interests, maxTasks = 10) {
  let selectedTasks = [];

  const shuffledInterestsTasks = interests.map((interest) => {
    const tasks = allTasks[interest] || [];
    return shuffleArray(tasks);
  });

  const tasksPerInterest = Math.ceil(maxTasks / interests.length);

  shuffledInterestsTasks.forEach((tasks) => {
    selectedTasks = selectedTasks.concat(tasks.slice(0, tasksPerInterest));
  });

  selectedTasks = shuffleArray(selectedTasks).slice(0, maxTasks);

  return selectedTasks;
}

function shuffleArray(array) {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

function renderTasks(tasks, taskProof) {
  const wrapper = document.querySelector(".tasks-wrapper");
  if (!wrapper) return;

  wrapper.innerHTML = "";

  tasks.forEach((task, i) => {
    const proofForTask = taskProof.find(
      (proof) => proof.taskIndex === i && (proof.approvedIndex === 0 || proof.approvedIndex === 1)
    );

    const container = document.createElement("div");
    container.className = "taskContainer";
    container.id = `task${i + 1}`;

    if (proofForTask) {
      container.classList.add("frozen");
    }

    const pointsText = task.points !== undefined ? `[${task.points} pts] ` : "";

    container.innerHTML = `
      <div class="task-info">
        <h2>${pointsText}${task.name || "Untitled Task"}</h2>
        <p>${task.description || "No description available."}</p>
      </div>
      <div class="task-actions">
        <a href="./rerollTask.html?taskIndex=${i}" class="reroll-btn">Reroll task</a>
        <a href="./taskProof.html?taskIndex=${i}" class="proof-btn">Submit proof</a>
      </div>
      ${
        proofForTask
          ? `<p class="frozen-message">Please wait for your task completion to be approved.</p>`
          : ""
      }
    `;

    wrapper.appendChild(container);
  });
}

initTaskPage();
