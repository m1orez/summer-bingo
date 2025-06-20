import { auth, db } from "./firebaseConfig.js";
import {
    onAuthStateChanged,
    User
} from "firebase/auth";
import {
    doc,
    getDoc,
    updateDoc,
    arrayUnion,
    collection
} from "firebase/firestore";

const CLOUD_NAME = "dqlfuyrwg";
const UPLOAD_PRESET = "pondsummerbingo";

const taskTitle = document.getElementById("task-title") as HTMLElement | null;
const taskDesc = document.getElementById("task-desc") as HTMLElement | null;
const form = document.getElementById("proofForm") as HTMLFormElement | null;

const urlParams = new URLSearchParams(window.location.search);
const taskIndexRaw = urlParams.get("taskIndex");
const taskIndex: number = taskIndexRaw !== null && !isNaN(parseInt(taskIndexRaw))
    ? parseInt(taskIndexRaw)
    : 0;

onAuthStateChanged(auth, async (user: User | null) => {
    if (!user) {
        console.warn("User not signed in. Redirecting...");
        window.location.href = "../index.html";
        return;
    }

    try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();

        const task = userData?.currentTasks?.[taskIndex];

        if (task) {
            if (taskTitle) taskTitle.textContent = task.name || "Submit Proof";
            if (taskDesc) taskDesc.textContent = task.description || "No description provided.";
        } else {
            if (taskTitle) taskTitle.textContent = "Task not found";
            if (taskDesc) taskDesc.textContent = "This task does not exist.";
            return;
        }

        if (form) {
            form.addEventListener("submit", async (e: SubmitEvent) => {
                e.preventDefault();

                const fileInput = document.getElementById("proofImage") as HTMLInputElement | null;
                if (!fileInput) {
                    alert("File input element not found.");
                    return;
                }

                const file = fileInput.files?.[0];
                if (!file) {
                    alert("Please select an image to upload.");
                    return;
                }

                const formData = new FormData();
                formData.append("file", file);
                formData.append("upload_preset", UPLOAD_PRESET);

                try {
                    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
                        method: "POST",
                        body: formData,
                    });

                    const data = await res.json();

                    if (!data.secure_url) {
                        throw new Error("Cloudinary did not return a secure_url");
                    }

                    const imageUrl: string = data.secure_url;

                    const proofObject = {
                        taskIndex,
                        taskName: task.name || "Unknown Task",
                        taskDescription: task.description || "No description provided.",
                        taskPoints: task.points || 0,
                        approvedIndex: 0,
                        denyIndex: 0,
                        imageUrl,
                    };

                    await updateDoc(userRef, {
                        taskProof: arrayUnion(proofObject)
                    });

                    alert("Proof uploaded and saved!");
                    window.location.href = "./tasks.html";

                } catch (uploadError) {
                    console.error("Upload or Firestore error:", uploadError);
                    alert("Failed to upload or save proof. Check console for details.");
                }
            });
        }
    } catch (fetchError) {
        console.error("Failed to load user data:", fetchError);
        alert("Error loading task data. Please try again.");
    }
});
