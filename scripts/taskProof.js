import { auth, db } from "./firebaseConfig.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const CLOUD_NAME = "dqlfuyrwg";
const UPLOAD_PRESET = "pondsummerbingo";

const taskTitle = document.getElementById("task-title");
const taskDesc = document.getElementById("task-desc");
const form = document.getElementById("proofForm");

const urlParams = new URLSearchParams(window.location.search);
const taskIndexRaw = urlParams.get("taskIndex");
const taskIndex = taskIndexRaw !== null && !isNaN(parseInt(taskIndexRaw)) ? parseInt(taskIndexRaw) : 0;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    console.warn("User not signed in. Redirecting...");
    window.location.href = "../index.html";
    return;
  }

  console.log("User signed in:", user.uid);

  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();

    const task = userData?.currentTasks?.[taskIndex];
    if (task) {
      taskTitle.textContent = task.name || "Submit Proof";
      taskDesc.textContent = task.description || "No description provided.";
    } else {
      taskTitle.textContent = "Task not found";
      taskDesc.textContent = "This task does not exist.";
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const fileInput = document.getElementById("proofImage");
      const file = fileInput.files[0];

      if (!file) {
        alert("Please select an image to upload.");
        return;
      }

      console.log("Uploading image to Cloudinary...");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);

      try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        console.log("Cloudinary response:", data);

        if (!data.secure_url) {
          throw new Error("Cloudinary did not return a secure_url");
        }

        const imageUrl = data.secure_url;
        console.log("Image uploaded to Cloudinary:", imageUrl);

        const proofObject = {
          taskIndex,
          approvedIndex: 0,
          denyIndex: 0,
          imageUrl,
          uploadedAt: new Date(),
        };

        await updateDoc(userRef, {
          taskProof: arrayUnion(proofObject)
        });

        console.log("Proof successfully added to user's taskProof array.");
        alert("Proof uploaded and saved!");
        window.location.href = "./tasks.html";

      } catch (uploadError) {
        console.error("Upload or Firestore error:", uploadError);
        alert("Failed to upload or save proof. Check console for details.");
      }
    });
  } catch (fetchError) {
    console.error("Failed to load user data:", fetchError);
    alert("Error loading task data. Please try again.");
  }
});
