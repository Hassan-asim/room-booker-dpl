import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom"; // Import BrowserRouter
// Use vite-plugin-pwa's runtime registration helper
import { registerSW } from 'virtual:pwa-register';

// Register service worker via the plugin helper. This works in dev when
// `devOptions.enabled` is true in `vite.config.ts`.
try {
  registerSW({ immediate: true });
} catch (e) {
  // virtual:pwa-register is only available when the plugin is enabled; swallow errors in other environments
  // eslint-disable-next-line no-console
  console.debug('PWA register helper not available', e);
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
