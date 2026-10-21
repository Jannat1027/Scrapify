// ---------------------------------------------------------------------------
// AuthContext: who is logged in.
// SIMULATED: there is no server and passwords are not checked. Logging in just
// remembers the user's id in localStorage. A real app would send the email and
// password to a backend and keep a secure session token instead.
// ---------------------------------------------------------------------------
import { createContext, useContext, useState } from "react";
import { loadFromStorage, removeFromStorage, saveToStorage, STORAGE_KEYS } from "../services/storage.js";
import { useData } from "./DataContext.jsx";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { data, insertRow } = useData();
  const [userId, setUserId] = useState(() => loadFromStorage(STORAGE_KEYS.session, null));

  // We only store the id, and look the user up each time, so admin changes (like a suspension) show at once.
  const user = data.users.find((person) => person.id === userId) || null;

  function logIn(person) {
    saveToStorage(STORAGE_KEYS.session, person.id);
    setUserId(person.id);
  }

  function logOut() {
    removeFromStorage(STORAGE_KEYS.session);
    setUserId(null);
  }

  // Saves a new account. It starts as "pending", so it can't log in until an admin approves it.
  function register(newUser) {
    insertRow("users", { ...newUser, status: "pending" });
  }

  const value = { user, logIn, logOut, register };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
