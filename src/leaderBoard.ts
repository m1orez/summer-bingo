import { db, auth } from './firebaseConfig';
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  DocumentData
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

async function loadLeaderboard(): Promise<void> {
  const leaderBoardDiv = document.getElementById('leaderBoard');
  if (!leaderBoardDiv) return;

  const usersRef = collection(db, "users");
  const q = query(usersRef, orderBy("seashells", "desc"), limit(10));

  try {
    const querySnapshot = await getDocs(q);
    const list = document.createElement('ul');

    querySnapshot.forEach((docSnap) => {
      const userData = docSnap.data() as DocumentData;
      const listItem = document.createElement('li');
      listItem.textContent = `${userData.seashells ?? 0} - ${userData.username || 'Unknown User'}`;
      list.appendChild(listItem);
    });

    leaderBoardDiv.appendChild(list);
  } catch (error) {
    console.error("Error loading leaderboard:", error);
    leaderBoardDiv.textContent = "Failed to load leaderboard.";
  }
}

async function updateSeashellsDisplay(uid: string): Promise<void> {
  const userDocRef = doc(db, "users", uid);

  try {
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      const data = userSnap.data() as DocumentData;
      const seashellEl = document.getElementById("seashells");
      if (seashellEl) {
        seashellEl.textContent = String(data.seashells ?? 0);
      }
    }
  } catch (error) {
    console.error("Error fetching seashells:", error);
  }
}

onAuthStateChanged(auth, (user: User | null) => {
  if (user) {
    updateSeashellsDisplay(user.uid);
  } else {
    console.warn("User not logged in.");
  }
});

loadLeaderboard();
