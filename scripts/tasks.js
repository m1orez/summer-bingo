import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { auth, db } from "./firebaseConfig.js";

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      if (!userData.interests || userData.interests.length === 0) {
        showInterestPopup();
      }
    }
  } else {
    window.location.href = "../index.html";
  }
});

function showInterestPopup() {
  const popup = document.createElement("div");
  popup.style.position = "fixed";
  popup.style.top = "0";
  popup.style.left = "0";
  popup.style.width = "100%";
  popup.style.height = "100%";
  popup.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
  popup.style.display = "flex";
  popup.style.alignItems = "center";
  popup.style.justifyContent = "center";
  popup.style.zIndex = "9999";

  popup.innerHTML = `
    <div style="
      background: white;
      padding: 2rem;
      border-radius: 8px;
      text-align: center;
      max-width: 400px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    ">
      <h2>Interests Missing</h2>
      <p>It looks like you haven't selected your interests yet.</p>
      <button id="goToInterests" style="
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      ">Choose Interests</button>
    </div>
  `;

  document.body.appendChild(popup);

  document.getElementById("goToInterests").addEventListener("click", () => {
    window.location.href = "./pickInterests.html";
  });
}
