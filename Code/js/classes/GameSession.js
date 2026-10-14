"use strict";

/*
----- GameSession -----
Keeps per-round scoring values together.
*/

export default class GameSession {
  constructor({ level = 1, mistakePenalty = 50, streakBonus = 5 } = {}) {
    this.level = level;
    this.mistakePenalty = mistakePenalty;
    this.streakBonusValue = streakBonus;

    this.score = 0;
    this.mistakes = 0;
    this.streak = 0;
    this.streakBonus = 0;
  }

  addMistake() {
    this.mistakes += 1;
    this.streak = 0;
    this.score = Math.max(0, this.score - this.mistakePenalty);
    return this.mistakes;
  }

  addScore(points) {
    this.score += Number(points || 0);
    return this.score;
  }

  addStreakBonus(streak) {
    this.streak = Number(streak || 0);
    const bonus = this.streak * this.streakBonusValue;
    this.streakBonus += bonus;
    this.score += bonus;
    return bonus;
  }
}
