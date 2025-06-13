import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { auth, db } from "./firebaseConfig.js";

let currentTasks = [];
let currentTaskProof = [];

const unlockTime = new Date("2025-06-10T01:00:00+02:00");

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
        // Check if email is verified before proceeding
        if (!user.emailVerified) {
          alert("You must verify your email before playing.");
          await auth.signOut();
          window.location.href = "../index.html";
          return;
        }

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
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
            } else if (userData.username) {
              navGreeting.textContent = `Hello, ${userData.username}`;
            } else {
              navGreeting.textContent = `Hello, ${user.email}`;
            }
          }

          if (!userData.interests || userData.interests.length === 0) {
            showInterestPopup();
          } else {
            if (userData.currentTasks && userData.currentTasks.length > 0) {
              currentTasks = userData.currentTasks;
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

async function generateAndSaveTasks(userRef, interests) {
  const response = await fetch("../tasks.json");
  const allTasks = await response.json();

  let pool = [];

  interests.forEach((interest) => {
    if (allTasks[interest]) {
      pool = pool.concat(allTasks[interest]);
    }
  });

  const selected = shuffleArray(pool).slice(0, 10);
  await updateDoc(userRef, { currentTasks: selected });
  return selected;
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

    container.innerHTML = `
      <div class="task-info">
        <h2>${task.name || "Untitled Task"}</h2>
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
