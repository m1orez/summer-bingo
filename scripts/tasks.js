import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { auth, db } from "./firebaseConfig.js";

let currentTasks = [];

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();

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
    .map(value => ({ value, sort: Math.random() }))
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
