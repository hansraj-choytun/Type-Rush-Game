"use strict";

/*
----- Main UI -----
Handles modals, settings, background music, brightness, and register steps.
*/

(function () {
  const loginModal = document.getElementById("loginModal");
  const registerModal = document.getElementById("registerModal");
  const leaderboardModal = document.getElementById("leaderboardModal");
  const settingsModal = document.getElementById("settingsModal");
  const profileModal = document.getElementById("profileModal");

  const openLoginBtn = document.getElementById("openLogin");
  const closeLoginBtn = document.getElementById("closeLogin");
  const closeRegisterBtn = document.getElementById("closeRegister");
  const showRegisterBtn = document.getElementById("showRegister");
  const showLoginBtn = document.getElementById("showLogin");
  const openLeaderboardBtn = document.getElementById("openLeaderboard");
  const closeLeaderboardBtn = document.getElementById("closeLeaderboard");
  const openSettingsBtn = document.getElementById("openSettings");
  const closeSettingsBtn = document.getElementById("closeSettings");
  const closeProfileBtn = document.getElementById("closeProfile");

  const registerStep1 = document.getElementById("registerStep1");
  const registerStep2 = document.getElementById("registerStep2");
  const nextRegisterStep = document.getElementById("nextRegisterStep");
  const backRegisterStep = document.getElementById("backRegisterStep");
  const dot1 = document.getElementById("stepDot1");
  const dot2 = document.getElementById("stepDot2");

  const soundToggleBtn = document.getElementById("soundToggle");
  const brightnessToggleBtn = document.getElementById("brightnessToggle");
  const termsLinkBtn = document.getElementById("openTerms");
  const bgMusic = document.getElementById("bgMusic");

  function openModal(modal) {
    if (modal) modal.classList.add("active");
  }

  function closeModal(modal) {
    if (modal) modal.classList.remove("active");
  }

  function showStepMessage(message) {
    const box = document.getElementById("registerStepMessage");
    if (!box) return;

    box.textContent = message;
    box.className = "form-message error";
  }

  function clearStepMessage() {
    const box = document.getElementById("registerStepMessage");
    if (!box) return;

    box.textContent = "";
    box.className = "form-message";
  }

  function resetRegisterSteps() {
    if (!registerStep1 || !registerStep2) return;

    registerStep1.classList.add("active");
    registerStep2.classList.remove("active");

    if (dot1) dot1.classList.add("active");
    if (dot2) dot2.classList.remove("active");

    clearStepMessage();
  }

  function validateRegisterStep1() {
    const firstName = document.getElementById("firstName")?.value.trim();
    const surname = document.getElementById("surname")?.value.trim();
    const age = Number(document.getElementById("age")?.value || 0);
    const email = document.getElementById("email")?.value.trim();

    if (!firstName || !surname || !age || !email) {
      showStepMessage("Please complete all personal details.");
      return false;
    }

    if (age < 12 || age > 100) {
      showStepMessage("Age must be between 12 and 100.");
      return false;
    }

    if (!email.includes("@") || !email.includes(".")) {
      showStepMessage("Please enter a valid email address.");
      return false;
    }

    clearStepMessage();
    return true;
  }

  function showRegisterStep2() {
    if (!validateRegisterStep1()) return;

    registerStep1.classList.remove("active");
    registerStep2.classList.add("active");

    if (dot1) dot1.classList.remove("active");
    if (dot2) dot2.classList.add("active");
  }

  function showRegisterStep1() {
    registerStep2.classList.remove("active");
    registerStep1.classList.add("active");

    if (dot2) dot2.classList.remove("active");
    if (dot1) dot1.classList.add("active");
  }

  function updateProfileModal() {
    const profileDetails = document.getElementById("profileDetails");
    if (!profileDetails) return;

    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

    if (!currentUser) {
      profileDetails.innerHTML = "<p>Please log in first.</p>";
      return;
    }

    profileDetails.innerHTML = `
      <p><strong>Name:</strong> ${currentUser.firstName || ""} ${currentUser.surname || ""}</p>
      <p><strong>Username:</strong> ${currentUser.username}</p>
      <p><strong>Age:</strong> ${currentUser.age || "-"}</p>
      <p><strong>Email:</strong> ${currentUser.email || "-"}</p>
      <hr>
      <p><strong>Games Played:</strong> ${currentUser.gamesPlayed || 0}</p>
      <p><strong>Highest Score:</strong> ${currentUser.highScore || 0}</p>
      <p><strong>Best WPM:</strong> ${currentUser.bestWPM || 0}</p>
      <p><strong>Best Accuracy:</strong> ${currentUser.bestAccuracy || 0}%</p>
    `;
  }

  function toggleSound() {
    if (!bgMusic) return;

    if (bgMusic.paused) {
      bgMusic.play()
        .then(() => {
          if (soundToggleBtn) soundToggleBtn.textContent = "🔊 Sound On";
        })
        .catch(() => {
          if (soundToggleBtn) soundToggleBtn.textContent = "🔇 Sound Blocked";
        });
    } else {
      bgMusic.pause();
      if (soundToggleBtn) soundToggleBtn.textContent = "🔇 Sound Off";
    }
  }

  function toggleBrightness() {
    document.body.classList.toggle("light-mode");
    localStorage.setItem(
      "typerush_light_mode",
      document.body.classList.contains("light-mode") ? "true" : "false"
    );
  }

  if (localStorage.getItem("typerush_light_mode") === "true") {
    document.body.classList.add("light-mode");
  }

  openLoginBtn?.addEventListener("click", () => openModal(loginModal));
  closeLoginBtn?.addEventListener("click", () => closeModal(loginModal));

  closeRegisterBtn?.addEventListener("click", () => closeModal(registerModal));
  showRegisterBtn?.addEventListener("click", () => {
    closeModal(loginModal);
    openModal(registerModal);
    resetRegisterSteps();
  });
  showLoginBtn?.addEventListener("click", () => {
    closeModal(registerModal);
    openModal(loginModal);
  });

  nextRegisterStep?.addEventListener("click", showRegisterStep2);
  backRegisterStep?.addEventListener("click", showRegisterStep1);

  openLeaderboardBtn?.addEventListener("click", () => {
    if (typeof window.displayLeaderboard === "function") {
      window.displayLeaderboard();
    }
    openModal(leaderboardModal);
  });
  closeLeaderboardBtn?.addEventListener("click", () => closeModal(leaderboardModal));

  openSettingsBtn?.addEventListener("click", () => openModal(settingsModal));
  closeSettingsBtn?.addEventListener("click", () => closeModal(settingsModal));

  closeProfileBtn?.addEventListener("click", () => closeModal(profileModal));

  document.querySelectorAll("[data-open-profile]").forEach(button => {
    button.addEventListener("click", () => {
      updateProfileModal();
      openModal(profileModal);
    });
  });

  soundToggleBtn?.addEventListener("click", toggleSound);
  brightnessToggleBtn?.addEventListener("click", toggleBrightness);
  termsLinkBtn?.addEventListener("click", () => {
    window.location.href = "terms.html";
  });

  window.addEventListener("click", event => {
    [loginModal, registerModal, leaderboardModal, settingsModal, profileModal].forEach(modal => {
      if (event.target === modal) {
        closeModal(modal);
      }
    });
  });

  window.resetRegisterSteps = resetRegisterSteps;
})();
