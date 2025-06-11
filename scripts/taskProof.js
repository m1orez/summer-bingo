import { auth, db, app } from "./firebaseConfig.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
import { doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const storage = getStorage(app);

const urlParams = new URLSearchParams(window.location.search);
const taskIndex = urlParams.get("taskIndex");

const taskTitleEl = document.getElementById("task-title");
const taskDescEl = document.getElementById("task-desc");
const proofForm = document.getElementById("proofForm");
const proofImageInput = document.getElementById("proofImage");
const statusMessage = document.getElementById("statusMessage");


auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "../index.html"; 
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const userData = userSnap.data();
    if (userData.currentTasks && userData.currentTasks.length > taskIndex) {
      const task = userData.currentTasks[taskIndex];
      taskTitleEl.textContent = `Submitting Proof for: ${task.name}`;
      taskDescEl.textContent = task.description;
    } else {
      taskTitleEl.textContent = "Task not found";
      taskDescEl.textContent = "";
    }
  }
});

proofForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusMessage.textContent = "Uploading proof...";

  const file = proofImageInput.files[0];
  if (!file) {
    statusMessage.textContent = "Please select an image file.";
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    statusMessage.textContent = "User not authenticated.";
    return;
  }

  try {
    const timestamp = Date.now();
    const storageRef = ref(storage, `taskProofs/${user.uid}/task_${taskIndex}_${timestamp}.${file.name.split('.').pop()}`);

    await uploadBytes(storageRef, file);

    const downloadURL = await getDownloadURL(storageRef);

    const userRef = doc(db, "users", user.uid);

    await updateDoc(userRef, {
      [`taskProofs.${taskIndex}`]: {
        imageUrl: downloadURL,
        timestamp: timestamp,
      }
    });

    statusMessage.textContent = "Proof uploaded successfully!";
    proofForm.reset();
  } catch (error) {
    console.error("Error uploading proof:", error);
    statusMessage.textContent = "Error uploading proof. Please try again.";
  }
});
