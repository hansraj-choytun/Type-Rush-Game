"use strict";

/*
----- Leaderboard -----
Stores one best score per username.
The current user's row is highlighted when displayed.
*/

(function () {
  const leaderboardBody = document.getElementById("leaderboardBody");

  function getScores() {
    try {
      return JSON.parse(localStorage.getItem("scores")) || [];
    } catch {
      return [];
    }
  }

  function saveScores(scores) {
    localStorage.setItem("scores", JSON.stringify(scores));
  }

  function getCurrentUsername() {
    try {
      return JSON.parse(localStorage.getItem("currentUser"))?.username || "";
    } catch {
      return "";
    }
  }

  function normaliseUsername(username) {
    return String(username || "Guest").trim();
  }

  function addScore(username, wpm, accuracy, score, level) {
    const cleanUsername = normaliseUsername(username);
    const scores = getScores();

    const newScore = {
      username: cleanUsername,
      wpm: Number(wpm || 0),
      accuracy: Number(accuracy || 0),
      score: Number(score || 0),
      level: Number(level || 1),
      date: new Date().toISOString()
    };

    const existingIndex = scores.findIndex(
      item => item.username.toLowerCase() === cleanUsername.toLowerCase()
    );

    if (existingIndex === -1) {
      scores.push(newScore);
    } else if (newScore.score > Number(scores[existingIndex].score || 0)) {
      scores[existingIndex] = newScore;
    }

    saveScores(scores);
    displayLeaderboard();
  }

  function getUniqueBestScores() {
    const bestByUser = new Map();

    getScores().forEach(score => {
      if (!score || !score.username) return;

      const key = score.username.toLowerCase();
      const existing = bestByUser.get(key);

      if (!existing || Number(score.score || 0) > Number(existing.score || 0)) {
        bestByUser.set(key, score);
      }
    });

    return Array.from(bestByUser.values())
      .sort((a, b) => Number(b.score || 0) - Number(a.score || 0));
  }

  function displayLeaderboard() {
    if (!leaderboardBody) return;

    const currentUsername = getCurrentUsername().toLowerCase();
    const topScores = getUniqueBestScores().slice(0, 10);

    leaderboardBody.innerHTML = "";

    if (!topScores.length) {
      leaderboardBody.innerHTML = `
        <tr>
          <td colspan="6">No scores yet. Play a game first!</td>
        </tr>
      `;
      return;
    }

    topScores.forEach((player, index) => {
      const row = document.createElement("tr");

      if (index === 0) row.classList.add("rank-1");
      if (index === 1) row.classList.add("rank-2");
      if (index === 2) row.classList.add("rank-3");

      if (player.username.toLowerCase() === currentUsername) {
        row.classList.add("current-player-row");
      }

      row.innerHTML = `
        <td class="rank">#${index + 1}</td>
        <td>${player.username}</td>
        <td>Level ${player.level || "-"}</td>
        <td>${player.wpm}</td>
        <td>${player.accuracy}%</td>
        <td>${player.score}</td>
      `;

      leaderboardBody.appendChild(row);
    });
  }

  window.getScores = getScores;
  window.saveScores = saveScores;
  window.addScore = addScore;
  window.displayLeaderboard = displayLeaderboard;

  displayLeaderboard();
})();
