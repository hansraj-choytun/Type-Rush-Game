"use strict";

/*
----- Player -----
Represents one registered player and their progress.
*/

export default class Player {
  constructor(data = {}) {
    this.firstName = data.firstName || "";
    this.surname = data.surname || "";
    this.age = data.age || "";
    this.email = data.email || "";
    this.username = data.username || "Guest";
    this.password = data.password || "";

    this.gamesPlayed = Number(data.gamesPlayed || 0);
    this.highScore = Number(data.highScore || 0);
    this.bestWPM = Number(data.bestWPM || 0);
    this.bestAccuracy = Number(data.bestAccuracy || 0);

    this.unlockedLevels = Array.isArray(data.unlockedLevels)
      ? data.unlockedLevels
      : [1];
  }

  recordGame(score, wpm, accuracy) {
    this.gamesPlayed += 1;
    this.highScore = Math.max(this.highScore, Number(score || 0));
    this.bestWPM = Math.max(this.bestWPM, Number(wpm || 0));
    this.bestAccuracy = Math.max(this.bestAccuracy, Number(accuracy || 0));
  }

  unlockLevel(level) {
    if (!this.unlockedLevels.includes(level)) {
      this.unlockedLevels.push(level);
      this.unlockedLevels.sort((a, b) => a - b);
    }
  }

  toJSON() {
    return {
      firstName: this.firstName,
      surname: this.surname,
      age: this.age,
      email: this.email,
      username: this.username,
      password: this.password,
      gamesPlayed: this.gamesPlayed,
      highScore: this.highScore,
      bestWPM: this.bestWPM,
      bestAccuracy: this.bestAccuracy,
      unlockedLevels: this.unlockedLevels
    };
  }
}
