import { db } from './firebaseConfig.js';
import { collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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
            listItem.textContent = `${userData.seashells} - ${userData.username || 'Unknown User'} `;
            list.appendChild(listItem);
        });

        leaderBoardDiv.appendChild(list);

    } catch (error) {
        console.error("Error loading leaderboard: ", error);
        leaderBoardDiv.textContent = "Failed to load leaderboard.";
    }
}

loadLeaderboard();
