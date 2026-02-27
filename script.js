import { quizData } from "./questions.js";

const startBtn = document.getElementById("start-btn");
const nicknameInput = document.getElementById("nickname");

const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const endScreen = document.getElementById("end-screen");

const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const timerEl = document.getElementById("timer");
const scoreEl = document.getElementById("score");
const finalScoreEl = document.getElementById("final-score");
const rankingList = document.getElementById("ranking-list");

const restartBtn = document.getElementById("restart-btn");

let currentQuestion = 0;
let score = 0;
let timer;
let timeLeft = 10;

const rankingBtn = document.getElementById("ranking-btn");

import { saveScore, realtimeRanking, resetRanking } from "./firebase.js";

const ADMIN_PASSWORD = "5169";

const bgm = document.getElementById("bgm");

startBtn.addEventListener("click", () => {
  if (!nicknameInput.value) return alert("닉네임 입력!");

  bgm.play(); // 🎵 음악 시작

  startScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  startGame();
});

function startGame() {
  score = 0;
  currentQuestion = 0;
  scoreEl.textContent = score;
  showQuestion();
}

function showQuestion() {
  const q = quizData[currentQuestion];
  questionEl.textContent = q.question;
  optionsEl.innerHTML = "";

  // 🔀 보기 섞기
  const shuffledOptions = [...q.options]
    .map((option) => ({ option, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map((obj) => obj.option);

  // 🔥 섞인 배열에서 정답 위치 다시 찾기
  const correctAnswer = q.options[q.answer];
  const newCorrectIndex = shuffledOptions.indexOf(correctAnswer);

  shuffledOptions.forEach((option, index) => {
    const div = document.createElement("div");
    div.textContent = option;
    div.classList.add("option-card");

    div.addEventListener("click", () => {
      selectAnswer(div, index, newCorrectIndex);
    });

    optionsEl.appendChild(div);
  });

  startTimer();
}

function startTimer() {
  timeLeft = 10;
  timerEl.textContent = timeLeft;

  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timer);
      endGame(); // ⏰ 시간 초과도 게임 종료
    }
  }, 1000);
}

function selectAnswer(element, selectedIndex, correctIndex) {
  clearInterval(timer);

  const allOptions = document.querySelectorAll(".option-card");

  allOptions.forEach((opt, i) => {
    if (i === correctIndex) {
      opt.classList.add("correct");
    } else if (i === selectedIndex) {
      opt.classList.add("wrong");
    }
    opt.style.pointerEvents = "none";
  });

  if (selectedIndex === correctIndex) {
    score += 10 + timeLeft;
    scoreEl.textContent = score;

    setTimeout(() => {
      nextQuestion();
    }, 800);
  } else {
    setTimeout(() => {
      nextQuestion(); // 🔥 여기만 바뀜
    }, 800);
  }
}

function nextQuestion() {
  currentQuestion++;

  if (currentQuestion < quizData.length) {
    showQuestion();
  } else {
    endGame();
  }
}

async function endGame() {
  gameScreen.classList.add("hidden");
  endScreen.classList.remove("hidden");

  finalScoreEl.textContent = score;

  await saveScore(nicknameInput.value, score);

  realtimeRanking((rankings) => {
    rankingList.innerHTML = "";
    rankings.forEach((r, i) => {
      const li = document.createElement("li");
      li.textContent = `${i + 1}위 - ${r.name} : ${r.score}`;
      rankingList.appendChild(li);
    });
  });
}

restartBtn.addEventListener("click", () => {
  endScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
});

rankingBtn.addEventListener("click", () => {
  startScreen.classList.add("hidden");
  endScreen.classList.remove("hidden");

  // 🔥 랭킹만 보기용 (점수 저장 안 함)
  realtimeRanking((rankings) => {
    rankingList.innerHTML = "";
    rankings.forEach((r, i) => {
      const li = document.createElement("li");
      li.textContent = `${i + 1}위 - ${r.name} : ${r.score}`;
      rankingList.appendChild(li);
    });
  });
});

const resetBtn = document.getElementById("reset-btn");

resetBtn.addEventListener("click", async () => {
  const password = prompt("관리자 비밀번호 입력");

  if (password === ADMIN_PASSWORD) {
    // 🔥 여기 원하는 비번으로 바꿔
    await resetRanking();
    alert("랭킹이 초기화되었습니다.");
  } else {
    alert("비밀번호가 틀렸습니다.");
  }
});

const musicToggle = document.getElementById("music-toggle");

let isPlaying = false;

musicToggle.addEventListener("click", () => {
  if (isPlaying) {
    bgm.pause();
    musicToggle.textContent = "🎵 음악 ON";
  } else {
    bgm.play();
    musicToggle.textContent = "🔊 음악 OFF";
  }
  isPlaying = !isPlaying;
});