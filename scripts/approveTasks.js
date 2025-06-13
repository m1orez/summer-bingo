import { auth, db } from "./firebaseConfig.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let currentUser = null;
let currentUserData = null;

const feedWrapper = document.querySelector(".proof-feed");

function shuffleArray(array) {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

async function generateAndSaveSingleTask(
  userRef,
  interests,
  completedTasks = [],
  skippedTasks = [],
  currentTasks = [],
  replaceIndex
) {
  const response = await fetch("../tasks.json");
  const allTasks = await response.json();

  let pool = [];
  interests.forEach((interest) => {
    if (allTasks[interest]) {
      pool = pool.concat(allTasks[interest]);
    }
  });

  const excludeTasks = [
    ...completedTasks,
    ...skippedTasks,
    ...currentTasks,
  ].map((t) => t.name);

  const filteredPool = pool.filter((task) => !excludeTasks.includes(task.name));

  if (filteredPool.length === 0) {
    return currentTasks;
  }

  const newTask = shuffleArray(filteredPool)[0];

  const updatedCurrentTasks = [...currentTasks];
  updatedCurrentTasks[replaceIndex] = newTask;

  await updateDoc(userRef, {
    currentTasks: updatedCurrentTasks,
  });

  return updatedCurrentTasks;
}

function renderProofs(proofs) {
  feedWrapper.innerHTML = "";
  if (proofs.length === 0) {
    feedWrapper.textContent = "No task proofs submitted yet.";
    return;
  }

  proofs.forEach((proof) => {
    const {
      taskIndex,
      approvedIndex,
      denyIndex,
      imageUrl,
      uploadedAt,
      userId,
      username,
      taskName,
      taskDescription,
      points,
    } = proof;

    const canVote =
      currentUser &&
      currentUser.uid !== userId &&
      !hasUserVoted(proof, currentUser.uid) &&
      currentUser.uid !== userId;

    const proofCard = document.createElement("div");
    proofCard.className = "proof-card";

    proofCard.innerHTML = `
      <img src="${imageUrl}" alt="Proof image" class="proof-image" />
      <div class="proof-info">
        <h3>${taskName || "Unnamed task"}</h3>
        <p>${taskDescription || ""}</p>
        <p>Points: ${points || 0}</p>
        <p>Submitted: ${new Date(uploadedAt.seconds * 1000).toLocaleString()}</p>
        <p>👍 ${approvedIndex || 0} &nbsp;&nbsp; 👎 ${denyIndex || 0}</p>
      </div>
      <div class="proof-actions">
        <button class="thumbs-up" ${canVote ? "" : "disabled"}>👍</button>
        <button class="thumbs-down" ${canVote ? "" : "disabled"}>👎</button>
      </div>
      <p class="proof-submitter">Submitted by: ${
        userId === currentUser.uid ? "You" : username
      }</p>
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

function hasUserVoted(proof, voterUid) {
  if (!proof.votes) return false;
  return proof.votes.some((vote) => vote.userId === voterUid);
}

async function fetchAllProofs() {
  const usersCol = collection(db, "users");
  const usersSnapshot = await getDocs(usersCol);

  let allProofs = [];

  for (const userDoc of usersSnapshot.docs) {
    const userData = userDoc.data();
    if (userData.taskProof && Array.isArray(userData.taskProof)) {
      userData.taskProof.forEach((proof) => {
        const task =
          (userData.currentTasks && userData.currentTasks[proof.taskIndex]) ||
          (userData.completedTasks && userData.completedTasks[proof.taskIndex]) ||
          null;

        allProofs.push({
          ...proof,
          userId: userDoc.id,
          username: userData.username || "Unknown User",
          taskName: task ? task.name : "Unknown Task",
          taskDescription: task ? task.description || "" : "",
          points: task ? task.points : 0,
        });
      });
    }
  }

  allProofs.sort((a, b) => b.uploadedAt.seconds - a.uploadedAt.seconds);

  return allProofs;
}

async function handleVote(proof, vote) {
  if (!currentUser) return alert("You must be logged in to vote.");
  if (currentUser.uid === proof.userId) return alert("You cannot vote on your own proof.");
  if (hasUserVoted(proof, currentUser.uid)) return alert("You have already voted on this proof.");

  const proofOwnerRef = doc(db, "users", proof.userId);

  try {
    const proofOwnerSnap = await getDoc(proofOwnerRef);
    if (!proofOwnerSnap.exists()) throw new Error("Proof owner user data missing.");

    const proofOwnerData = proofOwnerSnap.data();

    const proofIndex = proofOwnerData.taskProof.findIndex(
      (p) =>
        p.taskIndex === proof.taskIndex &&
        p.uploadedAt.seconds === proof.uploadedAt.seconds &&
        p.imageUrl === proof.imageUrl
    );
    if (proofIndex === -1) throw new Error("Proof object not found in owner's data.");

    const updatedProofs = [...proofOwnerData.taskProof];
    const targetProof = { ...updatedProofs[proofIndex] };

    if (!targetProof.votes) targetProof.votes = [];

    if (vote === 1) {
      targetProof.approvedIndex = (targetProof.approvedIndex || 0) + 1;
    } else if (vote === -1) {
      targetProof.denyIndex = (targetProof.denyIndex || 0) + 1;
    }

    targetProof.votes.push({ userId: currentUser.uid, vote });

    updatedProofs[proofIndex] = targetProof;

    await updateDoc(proofOwnerRef, {
      taskProof: updatedProofs,
    });

    await postVoteCheck(proofOwnerRef, proofOwnerData, targetProof);

    alert("Vote recorded!");
    loadAndRenderProofs();
  } catch (err) {
    alert("Failed to record vote: " + err.message);
  }
}

async function postVoteCheck(proofOwnerRef, proofOwnerData, proof) {
  if (proof.approvedIndex >= 2) {
    const taskToComplete = proofOwnerData.currentTasks?.[proof.taskIndex];
    if (!taskToComplete) return;

    const updatedCompleted = proofOwnerData.completedTasks ? [...proofOwnerData.completedTasks] : [];
    updatedCompleted.push(taskToComplete);

    const updatedCurrent = [...proofOwnerData.currentTasks];
    updatedCurrent.splice(proof.taskIndex, 1);

    const updatedProofs = (proofOwnerData.taskProof || []).filter(
      (p) => p.taskIndex !== proof.taskIndex
    );

    const newSeashells = (proofOwnerData.seashells || 0) + (taskToComplete.points || 0);

    const updatedCurrentWithNewTask = await generateAndSaveSingleTask(
      proofOwnerRef,
      proofOwnerData.interests,
      updatedCompleted,
      proofOwnerData.skippedTasks || [],
      updatedCurrent,
      proof.taskIndex
    );

    await updateDoc(proofOwnerRef, {
      completedTasks: updatedCompleted,
      currentTasks: updatedCurrentWithNewTask,
      taskProof: updatedProofs,
      seashells: newSeashells,
    });
  } else if (proof.denyIndex >= 2) {
    const updatedProofs = (proofOwnerData.taskProof || []).filter(
      (p) => p.taskIndex !== proof.taskIndex
    );

    await updateDoc(proofOwnerRef, {
      taskProof: updatedProofs,
    });
  }
}

async function loadAndRenderProofs() {
  try {
    const proofs = await fetchAllProofs();
    renderProofs(proofs);
  } catch {
    feedWrapper.textContent = "Failed to load proofs.";
  }
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "../index.html";
    return;
  }
  currentUser = user;

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    currentUserData = userSnap.data();
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      signOut(auth).then(() => {
        window.location.href = "../index.html";
      });
    });
  }

  loadAndRenderProofs();
});
