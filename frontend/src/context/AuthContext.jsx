import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [name, setName] = useState(localStorage.getItem("name") || null);
  const [role, setRole] = useState(localStorage.getItem("role") || null);

  function login(token, name, role) {
    localStorage.setItem("token", token);
    localStorage.setItem("name", name);
    localStorage.setItem("role", role);
    setName(name);
    setRole(role);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("role");
    setName(null);
    setRole(null);
  }

  return (
    <AuthContext.Provider value={{ name, role, isLoggedIn: !!name, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
