import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./App.css";
import { THEMES, applyTheme, getSavedTheme } from "./lib/themes";

// Apply saved theme before first render
const saved = getSavedTheme();
const theme = THEMES.find(t => t.key === saved) || THEMES[0];
applyTheme(theme);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
