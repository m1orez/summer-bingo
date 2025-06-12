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

const unlockTime = new Date("2025-06-14T01:00:00+02:00");


function showCountdown() {
  const wrapper = document.querySelector(".tasks-wrapper");
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
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();

          const seashellDisplay = document.getElementById("seashells");
          if (seashellDisplay) {
            seashellDisplay.textContent = userData.seashells || 0;
          }

          if (!userData.interests || userData.interests.length === 0) {
            showInterestPopup();
          } else {
            if (userData.currentTasks && userData.currentTasks.length > 0) {
              currentTasks = userData.currentTasks;
            } else {
              currentTasks = await generateAndSaveTasks(userRef, userData.interests);
            }
            renderTasks(currentTasks);
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

function renderTasks(tasks) {
  const wrapper = document.querySelector(".tasks-wrapper");
  wrapper.innerHTML = "";

  tasks.forEach((task, i) => {
    const container = document.createElement("div");
    container.className = "taskContainer";
    container.id = `task${i + 1}`;

    container.innerHTML = `
      <div class="task-info">
        <h2>${task.name || "Untitled Task"}</h2>
        <p>${task.description || "No description available."}</p>
      </div>
      <div class="task-actions">
        <a href="./rerollTask.html?taskIndex=${i}" class="reroll-btn">Reroll task</a>
        <a href="./taskProof.html?taskIndex=${i}" class="proof-btn">Submit proof</a>
      </div>
    `;

    wrapper.appendChild(container);
  });
}

initTaskPage();
