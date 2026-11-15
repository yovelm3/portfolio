/* Entry point: loads the fonts (bundled with the app, no third-party font server) and mounts the app. */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/archivo/600.css";
import "@fontsource/archivo/800.css";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "./styles.css";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
