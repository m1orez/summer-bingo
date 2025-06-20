import { db, auth } from './firebaseConfig.js';
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

async function loadLeaderboard() {
  const leaderBoardDiv = document.getElementById('leaderBoard');

  const usersRef = collection(db, "users");
  const q = query(usersRef, orderBy("seashells", "desc"), limit(10));

  try {
    const querySnapshot = await getDocs(q);
    const list = document.createElement('ul');

    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      const listItem = document.createElement('li');
      listItem.textContent = `${userData.seashells} - ${userData.username || 'Unknown User'}`;
      list.appendChild(listItem);
    });

    leaderBoardDiv.appendChild(list);
  } catch (error) {
    console.error("Error loading leaderboard: ", error);
    leaderBoardDiv.textContent = "Failed to load leaderboard.";
  }
}

async function updateSeashellsDisplay(uid) {
  const userDoc = doc(db, "users", uid);

  try {
    const userSnap = await getDoc(userDoc);
    if (userSnap.exists()) {
      const data = userSnap.data();
      document.getElementById("seashells").textContent = data.seashells ?? 0;
    }
  } catch (error) {
    console.error("Error fetching seashells: ", error);
  }
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    updateSeashellsDisplay(user.uid);
  } else {
    console.warn("User not logged in.");
  }
});

// Load leaderboard entries
loadLeaderboard();
