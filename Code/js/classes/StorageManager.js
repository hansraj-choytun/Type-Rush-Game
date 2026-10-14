"use strict";

/*
----- StorageManager -----
Small wrapper around localStorage so all JSON handling is consistent.
*/

export default class StorageManager {
  static getJSON(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  static setJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  static getUsers() {
    return this.getJSON("users", []);
  }

  static saveUsers(users) {
    this.setJSON("users", users);
  }

  static getCurrentUser() {
    return this.getJSON("currentUser", null);
  }

  static saveCurrentUser(user) {
    this.setJSON("currentUser", user);
  }

  static clearCurrentUser() {
    localStorage.removeItem("currentUser");
  }

  static updateUser(updatedUser) {
    if (!updatedUser || !updatedUser.username) return;

    const users = this.getUsers();
    const updated = users.map(user =>
      user.username.toLowerCase() === updatedUser.username.toLowerCase()
        ? updatedUser
        : user
    );

    this.saveUsers(updated);
  }
}
