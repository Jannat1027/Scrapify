// The starting point of the app. Vite loads this file from index.html.
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { DataProvider } from "./context/DataContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { startGlassSpotlight } from "./utils/glassSpotlight.js";
import { isBanglaMode, startBanglaMode } from "./utils/translate.js";
import "./index.css";

// The providers wrap the whole app, so every page can use the data, the login session and toasts.
// DataProvider comes first because AuthProvider reads the users from it.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <DataProvider>
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
      </DataProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

startGlassSpotlight();
if (isBanglaMode()) startBanglaMode();
