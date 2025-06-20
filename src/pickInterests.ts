import {
  onAuthStateChanged
} from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  DocumentData,
  DocumentReference
} from "firebase/firestore";

import { auth, db } from "./firebaseConfig";

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userRef: DocumentReference<DocumentData> = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      if (data.interests && data.interests.length > 0) {
        window.location.href = "tasks.html";
      }
    }
  } else {
    window.location.href = "../index.html";
  }
});

const cards = document.querySelectorAll('.interestCard') as NodeListOf<HTMLElement>;
const selectButton = document.querySelector('button') as HTMLButtonElement | null;
let selectedCards: string[] = [];

cards.forEach(card => {
  card.addEventListener('click', () => {
    const id = card.id;

    if (selectedCards.includes(id)) {
      selectedCards = selectedCards.filter(item => item !== id);
      card.classList.remove('selected');
    } else {
      selectedCards.push(id);
      card.classList.add('selected');
    }
  });
});

selectButton?.addEventListener('click', async () => {
  if (selectedCards.length < 3) {
    alert("Select at least 3 categories.");
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    alert("Not logged in");
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const data = userSnap.data();
    if (data.interests && data.interests.length > 0) {
      alert("You've already selected your interests.");
      window.location.href = "tasks.html";
      return;
    }
  }

  try {
    await updateDoc(userRef, {
      interests: selectedCards
    });

    window.location.href = "tasks.html";
  } catch (error) {
    console.error("Error updating interests: ", error);
    alert("Failed to save interests. Try again.");
  }
});
