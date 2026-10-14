"use strict";

import TypeRushGame from "./gameEngine.js";

/*
----- game.js -----
Entry point only:
- creates the game
- connects buttons and input events
- starts the game screen
*/

document.addEventListener("DOMContentLoaded", () => {
  const game = new TypeRushGame();

  game.ui.startBtn?.addEventListener("click", () => game.startRound());
  game.ui.resetBtn?.addEventListener("click", () => game.resetCurrentLevel());
  game.ui.backBtn?.addEventListener("click", () => game.backToLevels());

  game.ui.gameInput?.addEventListener("input", () => game.handleInput());
  game.ui.gameInput?.addEventListener("keydown", event => game.handleKeydown(event));

  game.ui.audioPlayBtn?.addEventListener("click", () => game.toggleAudio());
  game.ui.audioReplayBtn?.addEventListener("click", () => game.replayAudio());

  game.ui.resultNextBtn?.addEventListener("click", () => {
    const nextLevel = game.state.currentLevel + 1;

    if (nextLevel > 3) {
      game.initLevelSelect();
      return;
    }

    game.startLevel(nextLevel);
  });

  game.ui.resultRetryBtn?.addEventListener("click", () => {
    game.startLevel(game.state.currentLevel);
  });

  game.ui.resultMenuBtn?.addEventListener("click", () => {
    game.initLevelSelect();
  });

  game.init();
});
