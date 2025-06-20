import { auth, db } from "./firebaseConfig.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";


  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return;

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
    }
  });

const logoutBtn = document.getElementById("logoutBtn");

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

