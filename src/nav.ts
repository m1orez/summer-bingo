import { auth, db } from "./firebaseConfig";

import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, updateDoc, DocumentReference, DocumentData } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { signOut } from "firebase/auth";

interface UserData extends DocumentData {
  seashells?: number;
  username?: string;
}

onAuthStateChanged(auth, async (user: User | null) => {
  if (!user) return;

  if (!db) {
    console.error("Firestore db not initialized");
    return;
  }

  if (!user.uid) {
    console.error("User UID missing");
    return;
  }

  const userRef: DocumentReference<UserData> = doc(db, "users", user.uid) as DocumentReference<UserData>;

  try {
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return;

    const userData = userSnap.data();

    const seashellDisplay = document.getElementById("seashells");
    if (seashellDisplay) {
      seashellDisplay.textContent = String(userData.seashells ?? 0);
    }

    const navGreeting = document.getElementById("navGreeting");
    if (navGreeting) {
      if (user.displayName) {
        navGreeting.textContent = `Hello, ${user.displayName}`;
      } else if (userData.username) {
        navGreeting.textContent = `Hello, ${userData.username}`;
      } else {
        navGreeting.textContent = `Hello, ${user.email}`;
      }
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
});

const logoutBtn = document.getElementById("logoutBtn") as HTMLButtonElement | null;

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "../index.html";
    } catch (error) {
      console.error("Logout error:", error);
      alert("Error logging out. Please try again.");
    }
  });
}
