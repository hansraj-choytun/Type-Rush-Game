"use strict";

/*
----- Profile page -----
Displays the currently logged-in player's details and progress.
*/

(function () {
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  const profilePageDetails = document.getElementById("profilePageDetails");
  const profileStats = document.getElementById("profileStats");

  if (!profilePageDetails || !profileStats) return;

  if (!currentUser) {
    profilePageDetails.innerHTML = `
      <p>Please <a href="index.html" style="color:var(--gold);">log in</a> first.</p>
    `;

    profileStats.innerHTML = `
      <p><strong>Games Played</strong> <span>0</span></p>
      <p><strong>Highest Score</strong> <span>0</span></p>
      <p><strong>Best WPM</strong> <span>0</span></p>
      <p><strong>Best Accuracy</strong> <span>0%</span></p>
    `;
    return;
  }

  profilePageDetails.innerHTML = `
    <p><strong>Name:</strong> ${currentUser.firstName || ""} ${currentUser.surname || ""}</p>
    <p><strong>Username:</strong> ${currentUser.username || "-"}</p>
    <p><strong>Age:</strong> ${currentUser.age || "-"}</p>
    <p><strong>Email:</strong> ${currentUser.email || "-"}</p>
    <p><strong>Unlocked Levels:</strong> ${(currentUser.unlockedLevels || [1]).join(", ")}</p>
  `;

  profileStats.innerHTML = `
    <p><strong>Games Played</strong> <span>${currentUser.gamesPlayed || 0}</span></p>
    <p><strong>Highest Score</strong> <span>${currentUser.highScore || 0}</span></p>
    <p><strong>Best WPM</strong> <span>${currentUser.bestWPM || 0}</span></p>
    <p><strong>Best Accuracy</strong> <span>${currentUser.bestAccuracy || 0}%</span></p>
  `;
})();
