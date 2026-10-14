"use strict";

/*
----- Auth -----
Handles registration, login, logout, password-eye buttons, and navbar state.
*/

(function () {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const logoutBtn = document.getElementById("logoutBtn");
  const openLoginBtn = document.getElementById("openLogin");

  const loginModal = document.getElementById("loginModal");
  const registerModal = document.getElementById("registerModal");

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem("users")) || [];
    } catch {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
  }

  function setMessage(form, message, type) {
    if (!form) return;

    const box =
      form.id === "registerForm"
        ? document.getElementById("registerFinalMessage")
        : form.querySelector(".form-message");

    if (!box) return;

    box.textContent = message;
    box.className = "form-message " + type;
  }

  function clearMessage(form) {
    if (!form) return;

    form.querySelectorAll(".form-message").forEach(box => {
      box.textContent = "";
      box.className = "form-message";
    });
  }

  function setHint(id, message, type) {
    const hint = document.getElementById(id);
    if (!hint) return;

    hint.textContent = message;
    hint.className = "field-hint " + (type ? "hint-" + type : "");
  }

  function setInputState(input, valid) {
    if (!input) return;

    input.classList.remove("input-error", "input-ok");

    if (valid === true) input.classList.add("input-ok");
    if (valid === false) input.classList.add("input-error");
  }

  function showWelcome(message, type = "success") {
    const box = document.getElementById("welcomeMessage");
    if (!box) return;

    box.textContent = message;
    box.className = "welcome-message show " + type;

    setTimeout(() => box.classList.remove("show"), 3000);
  }

  function passwordStrength(password) {
    if (password.length < 6) return { ok: false, message: "Minimum 6 characters." };

    const checks = [
      /[A-Z]/.test(password),
      /\d/.test(password),
      /[^a-zA-Z0-9]/.test(password)
    ];

    const score = checks.filter(Boolean).length;

    if (score >= 2) return { ok: true, message: "Strong password ✓" };
    return { ok: true, message: "Password accepted. Add symbols for extra strength." };
  }

  function normaliseUser(user) {
    return {
      firstName: user.firstName || "",
      surname: user.surname || "",
      age: user.age || "",
      email: user.email || "",
      username: user.username || "",
      password: user.password || "",
      gamesPlayed: Number(user.gamesPlayed || 0),
      highScore: Number(user.highScore || 0),
      bestWPM: Number(user.bestWPM || 0),
      bestAccuracy: Number(user.bestAccuracy || 0),
      unlockedLevels: Array.isArray(user.unlockedLevels) ? user.unlockedLevels : [1]
    };
  }

  function updateNavbar() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

    if (currentUser) {
      if (openLoginBtn) openLoginBtn.style.display = "none";
      if (logoutBtn) logoutBtn.style.display = "block";
    } else {
      if (openLoginBtn) openLoginBtn.style.display = "inline-block";
      if (logoutBtn) logoutBtn.style.display = "none";
    }
  }

  /*
  ----- Login -----
  */

  if (loginForm) {
    const usernameInput = document.getElementById("loginUsername");
    const passwordInput = document.getElementById("loginPassword");

    usernameInput?.addEventListener("input", () => {
      const valid = usernameInput.value.trim().length >= 3;
      setInputState(usernameInput, usernameInput.value ? valid : null);
    });

    passwordInput?.addEventListener("input", () => {
      const valid = passwordInput.value.length >= 6;
      setInputState(passwordInput, passwordInput.value ? valid : null);
    });

    loginForm.addEventListener("submit", event => {
      event.preventDefault();

      const username = usernameInput?.value.trim() || "";
      const password = passwordInput?.value || "";

      clearMessage(loginForm);

      if (!username || !password) {
        setMessage(loginForm, "Please enter username and password.", "error");
        return;
      }

      const users = getUsers().map(normaliseUser);
      const user = users.find(
        item => item.username.toLowerCase() === username.toLowerCase()
      );

      if (!user) {
        setMessage(loginForm, "User not found.", "error");
        return;
      }

      if (user.password !== password) {
        setMessage(loginForm, "Incorrect password.", "error");
        return;
      }

      localStorage.setItem("currentUser", JSON.stringify(user));
      setMessage(loginForm, "Login successful!", "success");

      loginForm.reset();
      updateNavbar();

      setTimeout(() => {
        loginModal?.classList.remove("active");
        showWelcome("Welcome back, " + user.username + "! ☠️", "success");
        window.location.reload();
      }, 500);
    });
  }

  /*
  ----- Register -----
  */

  if (registerForm) {
    const fields = {
      firstName: document.getElementById("firstName"),
      surname: document.getElementById("surname"),
      age: document.getElementById("age"),
      email: document.getElementById("email"),
      username: document.getElementById("registerUsername"),
      password: document.getElementById("registerPassword"),
      confirm: document.getElementById("confirmPassword")
    };

    // ----- Step 1 live validation -----
function validateFirstName() {
  const value = fields.firstName.value.trim();

  if (!value) {
    setHint("hintFirstName", "", "");
    setInputState(fields.firstName, null);
    return false;
  }

  if (value.length < 2) {
    setHint("hintFirstName", "First name must be at least 2 characters.", "error");
    setInputState(fields.firstName, false);
    return false;
  }

  setHint("hintFirstName", "First name looks good ✓", "ok");
  setInputState(fields.firstName, true);
  return true;
}

function validateSurname() {
  const value = fields.surname.value.trim();

  if (!value) {
    setHint("hintSurname", "", "");
    setInputState(fields.surname, null);
    return false;
  }

  if (value.length < 2) {
    setHint("hintSurname", "Surname must be at least 2 characters.", "error");
    setInputState(fields.surname, false);
    return false;
  }

  setHint("hintSurname", "Surname looks good ✓", "ok");
  setInputState(fields.surname, true);
  return true;
}

function validateAge() {
  const value = Number(fields.age.value);

  if (!fields.age.value) {
    setHint("hintAge", "", "");
    setInputState(fields.age, null);
    return false;
  }

  if (value < 12 || value > 100) {
    setHint("hintAge", "Age must be between 12 and 100.", "error");
    setInputState(fields.age, false);
    return false;
  }

  setHint("hintAge", "Age accepted ✓", "ok");
  setInputState(fields.age, true);
  return true;
}

function validateEmail() {
  const value = fields.email.value.trim();

  if (!value) {
    setHint("hintEmail", "", "");
    setInputState(fields.email, null);
    return false;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    setHint("hintEmail", "Enter a valid email address.", "error");
    setInputState(fields.email, false);
    return false;
  }

  const users = getUsers().map(normaliseUser);
  const exists = users.some(
    user => user.email.toLowerCase() === value.toLowerCase()
  );

  if (exists) {
    setHint("hintEmail", "Email is already registered.", "error");
    setInputState(fields.email, false);
    return false;
  }

  setHint("hintEmail", "Email looks good ✓", "ok");
  setInputState(fields.email, true);
  return true;
}

fields.firstName?.addEventListener("input", validateFirstName);
fields.surname?.addEventListener("input", validateSurname);
fields.age?.addEventListener("input", validateAge);
fields.email?.addEventListener("input", validateEmail);

    fields.username?.addEventListener("input", () => {
      const username = fields.username.value.trim();
      const users = getUsers();

      if (!username) {
        setHint("hintUsername", "", "");
        setInputState(fields.username, null);
        return;
      }

      const exists = users.some(
        user => user.username?.toLowerCase() === username.toLowerCase()
      );

      if (username.length < 3) {
        setHint("hintUsername", "Username must be at least 3 characters.", "error");
        setInputState(fields.username, false);
      } else if (exists) {
        setHint("hintUsername", "Username already exists.", "error");
        setInputState(fields.username, false);
      } else {
        setHint("hintUsername", "Username available ✓", "ok");
        setInputState(fields.username, true);
      }
    });

    fields.password?.addEventListener("input", () => {
      const result = passwordStrength(fields.password.value);
      setHint("hintPassword", result.message, result.ok ? "ok" : "error");
      setInputState(fields.password, fields.password.value ? result.ok : null);
    });

    fields.confirm?.addEventListener("input", () => {
      const matches = fields.confirm.value === fields.password.value;

      if (!fields.confirm.value) {
        setHint("hintConfirm", "", "");
        setInputState(fields.confirm, null);
      } else if (matches) {
        setHint("hintConfirm", "Passwords match ✓", "ok");
        setInputState(fields.confirm, true);
      } else {
        setHint("hintConfirm", "Passwords do not match.", "error");
        setInputState(fields.confirm, false);
      }
    });

    registerForm.addEventListener("submit", event => {
      event.preventDefault();

      const firstName = fields.firstName?.value.trim() || "";
      const surname = fields.surname?.value.trim() || "";
      const age = Number(fields.age?.value || 0);
      const email = fields.email?.value.trim() || "";
      const username = fields.username?.value.trim() || "";
      const password = fields.password?.value || "";
      const confirmPassword = fields.confirm?.value || "";
      const users = getUsers().map(normaliseUser);

      clearMessage(registerForm);

      if (!firstName || !surname || !age || !email || !username || !password || !confirmPassword) {
        setMessage(registerForm, "Please complete every field.", "error");
        return;
      }

      if (age < 12 || age > 100) {
        setMessage(registerForm, "Age must be between 12 and 100.", "error");
        return;
      }

      if (!email.includes("@") || !email.includes(".")) {
        setMessage(registerForm, "Please enter a valid email address.", "error");
        return;
      }

      if (username.length < 3) {
        setMessage(registerForm, "Username must be at least 3 characters.", "error");
        return;
      }

      if (users.some(user => user.username.toLowerCase() === username.toLowerCase())) {
        setMessage(registerForm, "Username already exists.", "error");
        return;
      }

      if (users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
        setMessage(registerForm, "Email is already registered.", "error");
        return;
      }

      const strength = passwordStrength(password);

      if (!strength.ok) {
        setMessage(registerForm, strength.message, "error");
        return;
      }

      if (password !== confirmPassword) {
        setMessage(registerForm, "Passwords do not match.", "error");
        return;
      }

      const newUser = {
        firstName,
        surname,
        age,
        email,
        username,
        password,
        gamesPlayed: 0,
        highScore: 0,
        bestWPM: 0,
        bestAccuracy: 0,
        unlockedLevels: [1]
      };

      users.push(newUser);
      saveUsers(users);

      setMessage(registerForm, "Account created successfully. You can log in now.", "success");
      registerForm.reset();

      setTimeout(() => {
        registerModal?.classList.remove("active");
        loginModal?.classList.add("active");
        window.resetRegisterSteps?.();
      }, 700);
    });
  }

  /*
  ----- Password eye buttons -----
  */

  document.querySelectorAll(".password-eye").forEach(button => {
    button.addEventListener("click", () => {
      const input = document.getElementById(button.dataset.target);
      if (!input) return;

      const showing = input.type === "text";
      input.type = showing ? "password" : "text";
      button.textContent = showing ? "👁️" : "🙈";
      button.setAttribute("aria-label", showing ? "Show password" : "Hide password");
    });
  });

  /*
  ----- Logout -----
  */

  logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    updateNavbar();
    showWelcome("You have logged out successfully.", "logout");
    setTimeout(() => window.location.href = "index.html", 500);
  });

  updateNavbar();
  window.updateNavbar = updateNavbar;
})();
