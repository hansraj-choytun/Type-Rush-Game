"use strict";

/*
----- Terms page -----
Stores terms agreement per registered user when possible.
*/

document.addEventListener("DOMContentLoaded", () => {
  const checkbox = document.getElementById("termsCheckbox");
  const agreeBtn = document.getElementById("agreeBtn");

  if (!checkbox || !agreeBtn) return;

  function getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem("currentUser")) || null;
    } catch {
      return null;
    }
  }

  function saveCurrentUser(user) {
    localStorage.setItem("currentUser", JSON.stringify(user));

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const updated = users.map(item =>
      item.username === user.username ? user : item
    );

    localStorage.setItem("users", JSON.stringify(updated));
  }

  const currentUser = getCurrentUser();
  const alreadyAgreed =
    currentUser?.termsAgreed === true ||
    localStorage.getItem("termsAgreed") === "true";

  if (alreadyAgreed) {
    checkbox.checked = true;
    agreeBtn.disabled = false;
    agreeBtn.textContent = "✓ Already Agreed";
  }

  checkbox.addEventListener("change", () => {
    agreeBtn.disabled = !checkbox.checked;
  });

  agreeBtn.addEventListener("click", () => {
    if (!checkbox.checked) return;

    const user = getCurrentUser();

    if (user) {
      user.termsAgreed = true;
      saveCurrentUser(user);
    } else {
      localStorage.setItem("termsAgreed", "true");
    }

    agreeBtn.textContent = "✓ Agreed!";
    agreeBtn.style.background = "var(--gold)";
    agreeBtn.style.borderColor = "var(--gold)";
    agreeBtn.style.color = "#07121d";

    setTimeout(() => {
      window.location.href = "index.html";
    }, 700);
  });
});
