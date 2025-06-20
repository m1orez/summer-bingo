import { db, auth } from './firebaseConfig';
import {
  doc,
  getDoc,
  updateDoc,
  DocumentReference,
  DocumentData
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

interface Task {
  name: string;
  description?: string;
  points?: number;
}

interface UserData extends DocumentData {
  seashells?: number;
  currentTasks?: Task[];
  skippedTasks?: Task[];
  tasksCompleted?: Task[];
  interests?: string[];
}

const confirmBtn = document.getElementById('confirmBtn') as HTMLButtonElement | null;
const warningEl = document.getElementById('warning') as HTMLElement | null;
const seashellsEl = document.getElementById('seashells') as HTMLElement | null;

let currentTasks: Task[] = [];
let skippedTasks: Task[] = [];
let tasksCompleted: Task[] = [];
let interests: string[] = [];
let taskIndex: number | null = null;
let userDocRef: DocumentReference<UserData> | null = null;

onAuthStateChanged(auth, async (user: User | null) => {
  if (!user) {
    window.location.href = '../index.html';
    return;
  }

  userDocRef = doc(db, 'users', user.uid) as DocumentReference<UserData>;
  const userSnap = await getDoc(userDocRef);

  if (!userSnap.exists()) {
    window.location.href = '../index.html';
    return;
  }

  const userData = userSnap.data();
  seashellsEl!.textContent = String(userData.seashells ?? 0);
  currentTasks = userData.currentTasks ?? [];
  skippedTasks = userData.skippedTasks ?? [];
  tasksCompleted = userData.tasksCompleted ?? [];
  interests = userData.interests ?? [];

  const urlParams = new URLSearchParams(window.location.search);
  taskIndex = parseInt(urlParams.get('taskIndex') ?? '0');

  const currentTask = currentTasks[taskIndex];
  document.getElementById("taskName")!.textContent = currentTask?.name ?? "Task not found";
  document.getElementById("taskDescription")!.textContent = currentTask?.description ?? "";

  if (!currentTask) {
    if (confirmBtn) confirmBtn.disabled = true;
    if (warningEl) warningEl.textContent = "Task not found.";
    return;
  }

  if ((userData.seashells ?? 0) < 5) {
    if (confirmBtn) confirmBtn.disabled = true;
    if (warningEl) warningEl.textContent = "You do not have enough seashells to reroll this task";
  }
});

confirmBtn?.addEventListener('click', async () => {
  if (!userDocRef || taskIndex === null) return;

  confirmBtn.disabled = true;
  if (warningEl) warningEl.textContent = '';

  const userSnap = await getDoc(userDocRef);
  const userData = userSnap.data();

  if (!userData || (userData.seashells ?? 0) < 5) {
    if (warningEl) warningEl.textContent = "You do not have enough seashells to reroll this task";
    confirmBtn.disabled = true;
    return;
  }

  try {
    const response = await fetch('../tasks.json');
    const allTasks: Record<string, Task[]> = await response.json();

    let pool: Task[] = [];
    interests.forEach((interest) => {
      if (allTasks[interest]) {
        pool = pool.concat(allTasks[interest]);
      }
    });

    const excludedTasks = new Set([
      ...currentTasks.map((t) => t.name),
      ...skippedTasks.map((t) => t.name),
      ...tasksCompleted.map((t) => t.name)
    ]);

    const validTasks = pool.filter((t) => !excludedTasks.has(t.name));

    if (validTasks.length === 0) {
      if (warningEl) warningEl.textContent = "No new tasks available to reroll.";
      confirmBtn.disabled = false;
      return;
    }

    const newTask = validTasks[Math.floor(Math.random() * validTasks.length)];

    const oldTask = currentTasks[taskIndex];
    skippedTasks.push(oldTask);
    currentTasks[taskIndex] = newTask;

    if (userData) {
      await updateDoc(userDocRef, {
        currentTasks,
        skippedTasks,
        seashells: (userData.seashells ?? 0) - 5
      });
    }

    window.location.href = './tasks.html';
  } catch (error) {
    console.error("Reroll error:", error);
    if (warningEl) warningEl.textContent = "Failed to reroll task. Please try again.";
    confirmBtn.disabled = false;
  }
});

