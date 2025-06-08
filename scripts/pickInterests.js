import {
    getAuth,
    onAuthStateChanged,
    signOut
  } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
  import {
    doc,
    getDoc,
    updateDoc
  } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
  
  import { app, auth, db } from "./firebaseConfig.js";
  
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      if (!user.emailVerified) {
        alert("Please verify your email before continuing.");
        signOut(auth).then(() => {
          window.location.href = "../index.html";
        });
      } else {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
  
        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data.interests && data.interests.length > 0) {
            window.location.href = "tasks.html";
          }
        }
      }
    } else {
      window.location.href = "../index.html";
    }
  });
  
  const cards = document.querySelectorAll('.interestCard');
  const selectButton = document.querySelector('button');
  let selectedCards = [];
  
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
  
  selectButton.addEventListener('click', async () => {
    if (selectedCards.length < 3) {
      alert("Select at least 3 categories.");
      return;
    }
  
    const user = auth.currentUser;
    if (!user) return alert("Not logged in");
  
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
  
    if (userSnap.exists() && userSnap.data().interests?.length > 0) {
      alert("You've already selected your interests.");
      window.location.href = "tasks.html";
      return;
    }
  
    await updateDoc(userRef, {
      interests: selectedCards
    });
  
    window.location.href = "tasks.html";
  });
  