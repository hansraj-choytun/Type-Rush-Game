"use strict";

import Player from "./classes/Player.js";
import GameSession from "./classes/GameSession.js";
import StorageManager from "./classes/StorageManager.js";
import { CONFIG, LEVEL1_WORDS, LEVEL2_TEXTS, LEVEL3_AUDIOS } from "./gameData.js";

/*
----- TypeRushGame -----
All game rules, screens, scoring, audio, and level logic.
game.js only starts this class and connects event listeners.
*/

export default class TypeRushGame {
  constructor() {
    this.screens = {
      levelSelect: document.getElementById("screenLevelSelect"),
      game: document.getElementById("screenGame"),
      result: document.getElementById("screenResult")
    };

    this.ui = {
      gameTitle: document.getElementById("gameTitle"),
      statTime: document.getElementById("statTime"),
      statWpm: document.getElementById("statWpm"),
      statAccuracy: document.getElementById("statAccuracy"),
      statScore: document.getElementById("statScore"),
      streakBadge: document.getElementById("streakBadge"),
      streakCount: document.getElementById("streakCount"),
      streakBonus: document.getElementById("streakBonus"),
      progressFill: document.getElementById("levelProgressFill"),
      gameInput: document.getElementById("gameInput"),
      startBtn: document.getElementById("startBtn"),
      resetBtn: document.getElementById("resetBtn"),
      backBtn: document.getElementById("backToLevels"),

      l1Area: document.getElementById("l1Area"),
      l2Area: document.getElementById("l2Area"),
      l3Area: document.getElementById("l3Area"),
      imageArea: document.getElementById("imageArea"),
      imgProgress: document.getElementById("imgProgress"),
      textDisplay: document.getElementById("textDisplay"),
      transcriptArea: document.getElementById("transcriptArea"),
      audioWave: document.getElementById("audioWave"),
      audioLabel: document.getElementById("audioLabel"),
      audioStatus: document.getElementById("audioStatus"),
      audioPlayBtn: document.getElementById("audioPlayBtn"),
      audioReplayBtn: document.getElementById("audioReplayBtn"),

      hearts: [1, 2, 3, 4, 5].map(n => document.getElementById("h" + n)),

      resultTitle: document.getElementById("resultTitle"),
      resultSubtitle: document.getElementById("resultSubtitle"),
      resultImage: document.getElementById("resultImage"),
      rankDisplay: document.getElementById("rankDisplay"),
      rWpm: document.getElementById("rWpm"),
      rAcc: document.getElementById("rAcc"),
      rScore: document.getElementById("rScore"),
      rMistakes: document.getElementById("rMistakes"),
      rBonus: document.getElementById("rBonus"),
      rTime: document.getElementById("rTime"),
      resultMsg: document.getElementById("resultMsg"),
      resultNextBtn: document.getElementById("resultNextBtn"),
      resultRetryBtn: document.getElementById("resultRetryBtn"),
      resultMenuBtn: document.getElementById("resultMenuBtn"),

      cardLevel1: document.getElementById("cardLevel1"),
      cardLevel2: document.getElementById("cardLevel2"),
      cardLevel3: document.getElementById("cardLevel3"),
      progressSummary: document.getElementById("progressSummary")
    };

    this.gameAudio = document.getElementById("gameAudio");

    this.state = this.getFreshState();
  }

  /*
  ----- Startup -----
  */

  init() {
    this.initLevelSelect();
  }

  getFreshState() {
    return {
      currentLevel: 1,
      phase: "idle",
      timer: null,
      timeLeft: CONFIG.LEVEL_TIME,

      score: 0,
      mistakes: 0,
      streak: 0,
      streakBonus: 0,
      wordsTyped: 0,
      totalChars: 0,
      correctChars: 0,
      startTime: null,
      session: null,

      l1Index: 0,
      l1Shuffled: [],
      l1MistakePositions: new Set(),

      l2Text: "",
      l2MistakePositions: new Set(),

      l3Words: [],
      l3WordIndex: 0,
      l3AudioPlaying: false,
      l3CurrentAudio: null
    };
  }

  /*
  ----- Screens and level locking -----
  */

  showScreen(name) {
    Object.values(this.screens).forEach(screen => {
      if (screen) screen.classList.add("hidden");
    });

    if (this.screens[name]) {
      this.screens[name].classList.remove("hidden");
    }
  }

  getUnlockedLevels() {
    const currentUser = StorageManager.getCurrentUser();

    if (!currentUser) return [1];

    if (Array.isArray(currentUser.unlockedLevels) && currentUser.unlockedLevels.length) {
      return currentUser.unlockedLevels;
    }

    return [1];
  }

  initLevelSelect() {
    this.showScreen("levelSelect");
    this.stopAudio();

    const unlocked = this.getUnlockedLevels();
    const bestScores = StorageManager.getJSON("tr_bestScores", {});
    const messages = [];

    [1, 2, 3].forEach(level => {
      const card = this.ui["cardLevel" + level];
      if (!card) return;

      const isUnlocked = unlocked.includes(level);
      card.classList.toggle("locked", !isUnlocked);

      const badge = card.querySelector(".lock-badge");
      if (badge) badge.style.display = isUnlocked ? "none" : "block";

      card.onclick = () => {
        if (!isUnlocked) return;
        this.startLevel(level);
      };

      if (bestScores[level]) {
        messages.push("Level " + level + " best: " + bestScores[level] + " pts");
      }
    });

    if (this.ui.progressSummary) {
      this.ui.progressSummary.textContent = messages.join("  ·  ");
    }
  }

  /*
  ----- Level setup -----
  */

  startLevel(level) {
    this.state = this.getFreshState();
    this.state.currentLevel = level;
    this.state.session = new GameSession({
      level,
      mistakePenalty: CONFIG.MISTAKE_PENALTY,
      streakBonus: CONFIG.STREAK_BONUS
    });

    this.showScreen("game");
    this.hideLevelAreas();

    if (level === 1) {
      this.ui.gameTitle.textContent = "Level 1 — Image Typing";
      this.ui.l1Area.classList.remove("hidden");
      this.prepareLevel1();
    } else if (level === 2) {
      this.ui.gameTitle.textContent = "Level 2 — Paragraph Race";
      this.ui.l2Area.classList.remove("hidden");
      this.prepareLevel2();
    } else {
      this.ui.gameTitle.textContent = "Level 3 — Audio Dictation";
      this.ui.l3Area.classList.remove("hidden");
      this.prepareLevel3();
    }

    this.ui.gameInput.value = "";
    this.ui.gameInput.disabled = true;
    this.ui.startBtn.disabled = false;
    this.ui.startBtn.textContent = "⚓ Start";
    this.ui.progressFill.style.width = "0%";

    this.updateHearts();
    this.updateStats();
    this.updateStreak();
  }

  hideLevelAreas() {
    [this.ui.l1Area, this.ui.l2Area, this.ui.l3Area].forEach(area => {
      if (area) area.classList.add("hidden");
    });
  }

  startRound() {
    if (this.state.phase === "running") return;

    this.state.phase = "running";
    this.state.startTime = Date.now();

    this.ui.gameInput.disabled = false;
    this.ui.gameInput.focus();
    this.ui.startBtn.disabled = true;
    this.ui.startBtn.textContent = "⚓ Running…";

    if (this.state.currentLevel === 3) {
      this.ui.audioStatus.textContent = "Press ▶ Play Recording to begin.";
    }

    this.startTimer();
  }

  resetCurrentLevel() {
    this.stopAudio();
    this.startLevel(this.state.currentLevel);
  }

  backToLevels() {
    clearInterval(this.state.timer);
    this.stopAudio();
    this.initLevelSelect();
  }

  /*
  ----- Main game loop -----
  */

  tick() {
    if (this.state.phase !== "running") return;

    this.state.timeLeft -= 1;
    this.updateStats();
    this.bumpStat(this.ui.statTime);

    if (this.state.timeLeft <= 0) {
      this.endSession(false);
    }
  }

  startTimer() {
    clearInterval(this.state.timer);
    this.state.timer = setInterval(() => this.tick(), 1000);
  }

  /*
  ----- Input handling -----
  */

  handleInput() {
    if (this.state.phase !== "running") return;

    if (this.state.currentLevel === 1) {
      this.checkLevel1Live();
    }

    if (this.state.currentLevel === 2) {
      this.checkLevel2();
    }
  }

  handleKeydown(event) {
    if (this.state.phase !== "running") return;

    if (this.state.currentLevel === 2) return;

    if (event.key !== " " && event.key !== "Enter") return;

    event.preventDefault();

    const typed = this.ui.gameInput.value.trim();
    if (!typed) return;

    if (this.state.currentLevel === 1) {
      this.checkLevel1Submit(typed);
    }

    if (this.state.currentLevel === 3) {
      this.checkLevel3(typed);
    }
  }

  /*
  ----- Level 1 -----
  */

  prepareLevel1() {
    this.state.l1Shuffled = [...LEVEL1_WORDS].sort(() => Math.random() - 0.5);
    this.state.l1Index = 0;

    this.showLevel1Image();
    this.renderLevel1Feedback();
    this.updateLevel1Progress();
  }

  showLevel1Image() {
    const entry = this.state.l1Shuffled[this.state.l1Index];
    if (!entry || !this.ui.imageArea) return;

    this.ui.imageArea.innerHTML = `
      <img src="${entry.image}" alt="Type this word">
    `;

    this.ui.imageArea.classList.add("pop-in");
    setTimeout(() => this.ui.imageArea.classList.remove("pop-in"), 350);
  }

  updateLevel1Progress() {
    if (this.ui.imgProgress) {
      this.ui.imgProgress.textContent =
        "Word " + (this.state.l1Index + 1) + " / " + this.state.l1Shuffled.length;
    }

    this.ui.progressFill.style.width =
      (this.state.l1Index / this.state.l1Shuffled.length * 100) + "%";
  }

  renderLevel1Feedback() {
    const entry = this.state.l1Shuffled[this.state.l1Index];
    if (!entry) return;

    const word = entry.word.toLowerCase();
    const typed = this.ui.gameInput.value.trim().toLowerCase();

    let html = "";

    for (let i = 0; i < word.length; i++) {
      const stateClass =
        i < typed.length
          ? (typed[i] === word[i] ? "correct" : "wrong")
          : (i === typed.length ? "current" : "");

      html += `<span class="letter ${stateClass}">${word[i]}</span>`;
    }

    let box = document.getElementById("l1Feedback");
    if (!box) {
      box = document.createElement("div");
      box.id = "l1Feedback";
      box.className = "text-display l1-feedback game-graphic-frame";
      this.ui.imageArea.insertAdjacentElement("afterend", box);
    }

    box.innerHTML = html;
  }

  checkLevel1Live() {
    const entry = this.state.l1Shuffled[this.state.l1Index];
    if (!entry) return;

    const correct = entry.word.toLowerCase();
    const typed = this.ui.gameInput.value.trim().toLowerCase();

    for (let i = 0; i < typed.length; i++) {
      if (typed[i] !== correct[i] && !this.state.l1MistakePositions.has(i)) {
        this.state.l1MistakePositions.add(i);
        this.registerMistake();

        if (this.state.phase !== "running") return;
      }
    }

    this.state.l1MistakePositions.forEach(position => {
      if (typed[position] === correct[position] || position >= typed.length) {
        this.state.l1MistakePositions.delete(position);
      }
    });

    this.renderLevel1Feedback();

    if (typed === correct) {
      this.completeLevel1Word(correct);
    }
  }

  checkLevel1Submit(typed) {
    const entry = this.state.l1Shuffled[this.state.l1Index];
    if (!entry) return;

    if (typed.toLowerCase() === entry.word.toLowerCase()) {
      this.completeLevel1Word(entry.word.toLowerCase());
    } else {
      this.registerMistake();
    }
  }

  completeLevel1Word(word) {
    this.state.wordsTyped += 1;
    this.state.streak += 1;

    const bonus = this.state.session.addStreakBonus(this.state.streak);
    const points = 50 + bonus;

    this.state.streakBonus = this.state.session.streakBonus;
    this.state.score += points;
    this.state.correctChars += word.length;
    this.state.totalChars += word.length;

    this.showScoreDelta("+" + points, true);
    this.flashInput("flash-green");
    this.updateStreak();

    this.state.l1Index += 1;
    this.state.l1MistakePositions = new Set();
    this.ui.gameInput.value = "";

    if (this.state.l1Index >= this.state.l1Shuffled.length) {
      this.endSession(true);
      return;
    }

    this.showLevel1Image();
    this.updateLevel1Progress();
    this.renderLevel1Feedback();
    this.updateStats();
  }

  /*
  ----- Level 2 -----
  */

  prepareLevel2() {
    this.state.l2Text = LEVEL2_TEXTS[Math.floor(Math.random() * LEVEL2_TEXTS.length)];
    this.renderTextDisplay();
  }

  renderTextDisplay() {
    const text = this.state.l2Text;
    const typed = this.ui.gameInput.value;

    let html = "";

    for (let i = 0; i < text.length; i++) {
      const char = text[i] === " " ? "&nbsp;" : text[i];
      let className = "";

      if (i < typed.length) {
        className = typed[i] === text[i] ? "correct" : "wrong";
      } else if (i === typed.length) {
        className = "current";
      }

      html += `<span class="letter ${className}">${char}</span>`;
    }

    this.ui.textDisplay.innerHTML = html;
    this.ui.progressFill.style.width =
      (typed.length / text.length * 100) + "%";
  }

  checkLevel2() {
    const text = this.state.l2Text;
    const typed = this.ui.gameInput.value;

    let correctChars = 0;
    const currentWrong = new Set();

    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === text[i]) {
        correctChars += 1;
      } else {
        currentWrong.add(i);

        if (!this.state.l2MistakePositions.has(i)) {
          this.state.l2MistakePositions.add(i);
          this.registerMistake();

          if (this.state.phase !== "running") return;
        }
      }
    }

    this.state.l2MistakePositions.forEach(position => {
      if (!currentWrong.has(position)) {
        this.state.l2MistakePositions.delete(position);
      }
    });

    this.state.totalChars = typed.length;
    this.state.correctChars = correctChars;

    const targetWords = text.split(/\s+/);
    const typedWords = typed.split(/\s+/);

    let correctWords = 0;
    let streak = 0;
    let streakBonus = 0;

    typedWords.forEach((word, index) => {
      const completedWord = index < typedWords.length - 1 || typed.endsWith(" ");

      if (completedWord && word === targetWords[index]) {
        correctWords += 1;
        streak += 1;
        streakBonus += streak * CONFIG.STREAK_BONUS;
      } else if (completedWord) {
        streak = 0;
      }
    });

    this.state.wordsTyped = correctWords;
    this.state.streak = streak;
    this.state.streakBonus = streakBonus;

    const baseScore = correctChars * 2;
    const accuracy = typed.length > 0 ? correctChars / typed.length : 1;
    const accuracyBonus = Math.round(baseScore * accuracy);
    const speedBonus = correctWords * 10;
    const penalty = this.state.mistakes * CONFIG.MISTAKE_PENALTY;

    this.state.score = Math.max(
      0,
      baseScore + accuracyBonus + speedBonus + streakBonus - penalty
    );

    this.renderTextDisplay();
    this.updateStats();
    this.updateStreak();

    if (typed === text) {
      this.endSession(true);
    }
  }

  /*
  ----- Level 3 -----
  */

  prepareLevel3() {
    const pick = LEVEL3_AUDIOS[Math.floor(Math.random() * LEVEL3_AUDIOS.length)];

    this.state.l3CurrentAudio = pick;
    this.state.l3Words = pick.transcript.toLowerCase().split(/\s+/);
    this.state.l3WordIndex = 0;

    if (this.gameAudio) {
      this.gameAudio.src = pick.src;
      this.gameAudio.load();
      this.gameAudio.onended = () => this.setAudioPlaying(false);
    }

    this.ui.transcriptArea.classList.remove("visible");
    this.ui.transcriptArea.innerHTML = "";
    this.ui.audioStatus.textContent = "Audio loaded. Press Start, then Play Recording.";
    this.ui.audioLabel.textContent = "Press Play to start the recording.";

    this.updateAudioWave(false);
    this.updateLevel3Progress();
  }

  toggleAudio() {
    if (!this.gameAudio || this.state.currentLevel !== 3) return;

    if (this.state.phase !== "running") {
      this.ui.audioStatus.textContent = "Click Start before playing the recording.";
      return;
    }

    if (this.gameAudio.paused) {
      this.gameAudio.play()
        .then(() => this.setAudioPlaying(true))
        .catch(() => {
          this.ui.audioStatus.textContent =
            "Audio could not play. Check the file path and browser permissions.";
          this.setAudioPlaying(false);
        });
    } else {
      this.gameAudio.pause();
      this.setAudioPlaying(false);
    }
  }

  replayAudio() {
    if (!this.gameAudio || this.state.currentLevel !== 3) return;

    if (this.state.phase !== "running") {
      this.ui.audioStatus.textContent = "Click Start before replaying the recording.";
      return;
    }

    this.gameAudio.currentTime = 0;

    this.gameAudio.play()
      .then(() => this.setAudioPlaying(true))
      .catch(() => {
        this.ui.audioStatus.textContent =
          "Audio could not replay. Check the file path and browser permissions.";
        this.setAudioPlaying(false);
      });
  }

  setAudioPlaying(isPlaying) {
    this.state.l3AudioPlaying = isPlaying;
    this.updateAudioWave(isPlaying);

    if (this.ui.audioPlayBtn) {
      this.ui.audioPlayBtn.textContent = isPlaying ? "⏸ Pause Recording" : "▶ Play Recording";
    }

    if (this.ui.audioLabel) {
      this.ui.audioLabel.textContent = isPlaying
        ? "🎧 Listening — type the words you hear."
        : "Recording paused.";
    }
  }

  updateAudioWave(isPlaying) {
    if (!this.ui.audioWave) return;

    this.ui.audioWave.querySelectorAll(".wave-bar").forEach(bar => {
      bar.classList.toggle("paused", !isPlaying);
    });
  }

  updateLevel3Progress() {
    this.ui.progressFill.style.width =
      (this.state.l3WordIndex / this.state.l3Words.length * 100) + "%";

    this.ui.audioStatus.textContent =
      "Typed word " + this.state.l3WordIndex + " / " + this.state.l3Words.length;
  }

  checkLevel3(typed) {
    const target = this.state.l3Words[this.state.l3WordIndex];
    if (!target) return;

    if (typed.trim().toLowerCase() === target) {
      this.state.wordsTyped += 1;
      this.state.l3WordIndex += 1;
      this.state.streak += 1;
      this.state.correctChars += target.length;
      this.state.totalChars += target.length;

      const bonus = this.state.streak * CONFIG.STREAK_BONUS;
      const points = 40 + bonus;

      this.state.streakBonus += bonus;
      this.state.score += points;

      this.showScoreDelta("+" + points, true);
      this.flashInput("flash-green");
      this.updateStreak();
      this.updateLevel3Progress();

      if (this.state.l3WordIndex >= this.state.l3Words.length) {
        this.endSession(true);
        return;
      }
    } else {
      this.registerMistake();
    }

    this.ui.gameInput.value = "";
    this.updateStats();
  }

  stopAudio() {
    if (!this.gameAudio) return;

    this.gameAudio.pause();
    this.gameAudio.currentTime = 0;
    this.setAudioPlaying(false);
  }

  /*
  ----- Scoring, mistakes, and stats -----
  */

  registerMistake() {
    if (this.state.phase !== "running") return;
    if (this.state.mistakes >= CONFIG.MAX_MISTAKES) return;

    this.state.session.addMistake();
    this.state.mistakes += 1;
    this.state.streak = 0;

    if (this.state.currentLevel !== 2) {
      this.state.score = Math.max(0, this.state.score - CONFIG.MISTAKE_PENALTY);
      this.showScoreDelta("-" + CONFIG.MISTAKE_PENALTY, false);
    }

    this.flashInput("shake");
    this.updateHearts();
    this.updateStats();
    this.updateStreak();

    if (this.state.mistakes >= CONFIG.MAX_MISTAKES) {
      this.endSession(false);
    }
  }

  updateHearts() {
    this.ui.hearts.forEach((heart, index) => {
      if (!heart) return;
      heart.classList.toggle("lost", index >= CONFIG.MAX_MISTAKES - this.state.mistakes);
    });
  }

  updateStreak() {
    if (!this.ui.streakBadge) return;

    if (this.state.streak > 1) {
      this.ui.streakBadge.classList.remove("hidden");
      this.ui.streakCount.textContent = this.state.streak;
      this.ui.streakBonus.textContent = this.state.streak * CONFIG.STREAK_BONUS;
    } else {
      this.ui.streakBadge.classList.add("hidden");
    }
  }

  getElapsedMinutes() {
    if (!this.state.startTime) return 1;
    return Math.max((Date.now() - this.state.startTime) / 60000, 1 / 60);
  }

  getWPM() {
    return Math.round(this.state.wordsTyped / this.getElapsedMinutes());
  }

  getAccuracy() {
    return this.state.totalChars > 0
      ? Math.round(this.state.correctChars / this.state.totalChars * 100)
      : 100;
  }

  updateStats() {
    if (!this.ui.statTime) return;

    this.ui.statTime.textContent = Math.max(0, this.state.timeLeft);
    this.ui.statWpm.textContent = this.getWPM();
    this.ui.statAccuracy.textContent = this.getAccuracy() + "%";
    this.ui.statScore.textContent = Math.round(this.state.score);

    this.bumpStat(this.ui.statScore);
  }

  /*
  ----- Result screen -----
  */

  endSession(completed) {
    if (this.state.phase === "result") return;

    clearInterval(this.state.timer);
    this.state.phase = "result";
    this.stopAudio();
    this.ui.gameInput.disabled = true;

    const wpm = this.getWPM();
    const accuracy = this.getAccuracy();
    const finalScore = Math.max(0, Math.round(this.state.score));
    const timeTaken = CONFIG.LEVEL_TIME - Math.max(0, this.state.timeLeft);
    const level = this.state.currentLevel;
    const passMark = level === 1 ? CONFIG.L1_PASS_SCORE : CONFIG.L2_PASS_SCORE;
    const mistakesMaxed = this.state.mistakes >= CONFIG.MAX_MISTAKES;
    const passed =level === 3 ? completed : finalScore >= passMark;
    this.saveBestScore(level, finalScore);
    this.saveLeaderboardScore(wpm, accuracy, finalScore, level);
    this.updatePlayerProgress(passed, level, finalScore, wpm, accuracy);

    this.showScreen("result");
    this.renderResultScreen({
      completed,
      passed,
      mistakesMaxed,
      level,
      passMark,
      finalScore,
      wpm,
      accuracy,
      timeTaken
    });
  }

  saveBestScore(level, score) {
    const bestScores = StorageManager.getJSON("tr_bestScores", {});

    if (!bestScores[level] || score > bestScores[level]) {
      bestScores[level] = score;
      StorageManager.setJSON("tr_bestScores", bestScores);
    }
  }

  saveLeaderboardScore(wpm, accuracy, score, level) {
    const currentUser = StorageManager.getCurrentUser();
    if (!currentUser || typeof window.addScore !== "function") return;

    window.addScore(currentUser.username, wpm, accuracy, score, level);

    if (typeof window.displayLeaderboard === "function") {
      window.displayLeaderboard();
    }
  }

  updatePlayerProgress(passed, level, score, wpm, accuracy) {
    const currentUser = StorageManager.getCurrentUser();
    if (!currentUser) return;

    const player = new Player(currentUser);
    player.recordGame(score, wpm, accuracy);

    if (passed && level < 3) {
      player.unlockLevel(level + 1);
    }

    StorageManager.saveCurrentUser(player.toJSON());
    StorageManager.updateUser(player.toJSON());
  }

  renderResultScreen(result) {
    const rank = this.getRank(result.finalScore);

    if (this.ui.resultImage) {
      this.ui.resultImage.classList.remove("win-image", "lose-image");
      this.ui.resultImage.src = result.passed
        ? "../assets/images/results/win.png"
        : "../assets/images/results/lose.png";
      this.ui.resultImage.classList.add(result.passed ? "win-image" : "lose-image");
    }

    if (result.mistakesMaxed) {
      this.ui.resultTitle.textContent = "Out of Lives!";
      this.ui.resultSubtitle.textContent = "You used all 5 lives. Here is your result.";
    } else if (result.completed) {
      this.ui.resultTitle.textContent =
        result.level === 3 ? "🏴‍☠️ Grand Line Complete!" : "Voyage Complete!";
      this.ui.resultSubtitle.textContent =
        result.passed ? "You passed this challenge." : "Good effort — keep practising.";
    } else {
      this.ui.resultTitle.textContent = "Time's Up!";
      this.ui.resultSubtitle.textContent = "The sea waits for no one. Here are your results.";
    }

    this.ui.rankDisplay.textContent = rank.label;
    this.ui.rankDisplay.className = "rank-display " + rank.className + " pop-in";

    this.ui.rWpm.textContent = result.wpm;
    this.ui.rAcc.textContent = result.accuracy + "%";
    this.ui.rScore.textContent = result.finalScore;
    this.ui.rMistakes.textContent = this.state.mistakes;
    this.ui.rBonus.textContent = "+" + this.state.streakBonus;
    this.ui.rTime.textContent = result.timeTaken + "s";

    if (result.passed) {
      this.ui.resultMsg.textContent =
        result.level < 3
          ? "✅ Passed! Level " + (result.level + 1) + " is now unlocked."
          : "🏆 You completed all 3 levels!";
      this.ui.resultMsg.className = "result-msg pass";
      this.ui.resultNextBtn.disabled = false;
      this.ui.resultNextBtn.textContent =
        result.level < 3 ? "Next Level (" + (result.level + 1) + ") →" : "🏆 All Done!";
    } else {
      const needed = Math.max(0, result.passMark - result.finalScore);
      this.ui.resultMsg.textContent = result.mistakesMaxed
        ? "❌ Session ended because all lives were lost."
        : "You need " + needed + " more points to unlock the next level.";
      this.ui.resultMsg.className = "result-msg fail";
      this.ui.resultNextBtn.disabled = true;
      this.ui.resultNextBtn.textContent = "Next Level →";
    }
  }

  getRank(score) {
    if (score >= 800) return { label: "S — Grand Line King", className: "rank-s" };
    if (score >= 500) return { label: "A — Pirate Captain", className: "rank-a" };
    if (score >= 300) return { label: "B — Rookie Sailor", className: "rank-b" };
    return { label: "C — Sea Apprentice", className: "rank-c" };
  }

  /*
  ----- Visual effects -----
  */

  flashInput(className) {
    this.ui.gameInput.classList.remove("shake", "flash-green");
    void this.ui.gameInput.offsetWidth;
    this.ui.gameInput.classList.add(className);

    setTimeout(() => {
      this.ui.gameInput.classList.remove(className);
    }, 400);
  }

  showScoreDelta(text, positive) {
    const delta = document.createElement("div");

    delta.className = "score-delta " + (positive ? "positive" : "negative");
    delta.textContent = text;

    const rect = this.ui.statScore.getBoundingClientRect();
    delta.style.left = rect.left + "px";
    delta.style.top = rect.top + "px";

    document.body.appendChild(delta);
    setTimeout(() => delta.remove(), 850);
  }

  bumpStat(element) {
    if (!element) return;

    element.classList.remove("bump");
    void element.offsetWidth;
    element.classList.add("bump");
  }
}
