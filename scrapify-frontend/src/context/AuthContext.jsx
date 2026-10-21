// ---------------------------------------------------------------------------
// AuthContext: who is using the app.
// SIMULATED: there is no server and no login page. The demo operator (u1 in
// src/data/seed.js) is always the current user. A real app would check the
// email and password on a backend and keep a secure session token instead.
// ---------------------------------------------------------------------------
import { createContext, useContext } from "react";
import { useData } from "./DataContext.jsx";

const AuthContext = createContext(null);
const DEMO_OPERATOR_ID = "u1";

export function AuthProvider({ children }) {
  const { data } = useData();

  // We look the user up each time, so changes to their details show at once.
  const user = data.users.find((person) => person.id === DEMO_OPERATOR_ID);

  const value = { user };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
