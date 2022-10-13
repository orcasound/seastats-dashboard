import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "./components/ErrorFallback";
import { mountOptions } from "./utils/mountOptions";
import { getUrlParams } from "./utils/helpers";

let root;
let rootNode;

function mount(querySelector = "#SeaStats", options = {}) {
  unmount();
  rootNode = document.querySelector(querySelector);
  if (!rootNode) throw new Error("No match for query selector");
  rootNode.classList.add("SeaStats_AppRoot");
  root = ReactDOM.createRoot(rootNode);

  const defaultOptions = new mountOptions();
  const { organizationKey, stationKey, ...mergedOptions } = {
    ...defaultOptions,
    ...getUrlParams(),
    ...options,
  };

  root.render(
    <React.StrictMode>
      <ErrorBoundary fallbackRender={ErrorFallback}>
        <App
          organizationKey={organizationKey}
          stationKey={stationKey}
          options={mergedOptions}
        />
      </ErrorBoundary>
    </React.StrictMode>
  );
}

function unmount() {
  if (root) {
    root.unmount();
  }
  if (rootNode) {
    rootNode.classList.remove("SeaStats_AppRoot");
  }
}

// Expose a global API for the SeaStats app
window.seaStats = {
  mount,
  unmount,
  options: mountOptions,
};
window.dispatchEvent(new Event("SeaStats_Loaded"));
