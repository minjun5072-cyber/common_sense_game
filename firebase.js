import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  orderBy,
  limit,
  onSnapshot,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDSSN5V792iZCUkCIEm5J9KUgUWLJxwJU8",
  authDomain: "common-sense-game.firebaseapp.com",
  projectId: "common-sense-game",
  storageBucket: "common-sense-game.firebasestorage.app",
  messagingSenderId: "610095485682",
  appId: "1:610095485682:web:051acdf067d90e5f61f66b",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function saveScore(name, score) {
  const rankingsRef = collection(db, "rankings");

  // 🔎 같은 닉네임 있는지 검색
  const q = query(rankingsRef, where("name", "==", name));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    // 이미 존재 → 기존 점수와 비교 후 업데이트
    const docSnapshot = querySnapshot.docs[0];
    const existingScore = docSnapshot.data().score;

    if (score > existingScore) {
      await updateDoc(doc(db, "rankings", docSnapshot.id), {
        score: score,
        createdAt: Date.now(),
      });
    }
  } else {
    // 없으면 새로 추가
    await addDoc(rankingsRef, {
      name: name,
      score: score,
      createdAt: Date.now(),
    });
  }
}

// 🔥 실시간 랭킹 (상위 5명)
export function realtimeRanking(callback) {
  const q = query(
    collection(db, "rankings"),
    orderBy("score", "desc"),
    limit(5),
  );

  onSnapshot(q, (snapshot) => {
    const rankings = [];
    snapshot.forEach((doc) => {
      rankings.push(doc.data());
    });
    callback(rankings);
  });
}

export async function resetRanking() {
  const snapshot = await getDocs(collection(db, "rankings"));

  const deletePromises = snapshot.docs.map((docItem) =>
    deleteDoc(doc(db, "rankings", docItem.id)),
  );

  await Promise.all(deletePromises);
}