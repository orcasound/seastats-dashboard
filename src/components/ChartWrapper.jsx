import { useContext, useLayoutEffect, useState } from "react";
import { Settings } from "../context/Settings";
import { AppState } from "../context/AppState";
import {
  faAnglesRight,
  faBars,
  faClose,
  faQuestion,
  faSliders,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function ChartWrapper({
  settingsControls,
  children,
  buttons,
  title,
  footer,
  modalContent,
  closeModal,
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const { layoutMode } = useContext(Settings);
  const { selectedChart, navOpen, setNavOpen } = useContext(AppState);

  useLayoutEffect(() => {
    // Force the Plotly charts to resize when the window is resized
    window.dispatchEvent(new Event("resize"));
  }, [settingsOpen]);

  useLayoutEffect(() => {
    // Reset the settings when the layout mode changes
    if (layoutMode === "mobile") {
      setSettingsOpen(false);
    } else {
      setSettingsOpen(true);
    }
  }, [layoutMode]);

  function handleSettingsWrapperClick(event) {
    // Close the nav if the user clicks directly on this element
    if (layoutMode === "mobile" && event.target === event.currentTarget) {
      setSettingsOpen(false);
    }
  }

  const { descriptionHtml } = selectedChart;

  return (
    <>
      <main className="ss_ContentWrapper">
        <header className="ss_header">
          <h1>
            {title}{" "}
            {descriptionHtml && (
              <button
                className="ss_info"
                onClick={() => setInfoOpen(!infoOpen)}
                aria-label="information"
              >
                <FontAwesomeIcon icon={faQuestion} />
              </button>
            )}
          </h1>
          <div className="ss_buttons">
            {buttons}
            {(layoutMode === "mobile" || !navOpen) && (
              <button className="ss_openMenu" onClick={() => setNavOpen(true)}>
                <span className="ss_iconLeft">
                  <FontAwesomeIcon icon={faBars} />
                </span>
                Menu
              </button>
            )}
            {settingsControls && (layoutMode === "mobile" || !settingsOpen) && (
              <button
                className="ss_openSettings"
                onClick={() => setSettingsOpen(true)}
              >
                <span className="ss_iconLeft">
                  <FontAwesomeIcon icon={faSliders} />
                </span>
                Settings
              </button>
            )}
          </div>
        </header>
        <div className="ss_content">
          {children}
          {modalContent && (
            <div className="ss_modalOverlay">
              <div className="ss_modalVeil" onClick={() => closeModal()}></div>
              <div className="ss_modalFrame">
                <div className="ss_modalContent">{modalContent}</div>
                <button
                  className="ss_closeModal"
                  onClick={() => closeModal()}
                  aria-label="Close"
                  title="Close"
                >
                  <FontAwesomeIcon icon={faClose} />
                </button>
              </div>
            </div>
          )}
          {infoOpen && (
            <div className="ss_infoContent">
              <div
                className="ss_description"
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />
              <button
                className="ss_closeInfo"
                onClick={() => setInfoOpen(false)}
                aria-label="Close"
              >
                <span className="ss_iconLeft">
                  <FontAwesomeIcon icon={faClose} />
                </span>
                Close
              </button>
            </div>
          )}
        </div>
        {footer && <footer className="ss_footer">{footer}</footer>}
      </main>
      {settingsControls && (
        <div
          className={[
            "ss_SettingsWrapper",
            settingsOpen ? "settings-open" : "",
          ].join(" ")}
          onClick={handleSettingsWrapperClick}
        >
          <aside className="ss_Settings">
            <h3>Settings</h3>
            {settingsControls}
            <button className="ss_close" onClick={() => setSettingsOpen(false)}>
              Close Settings
              <span className="ss_iconRight">
                <FontAwesomeIcon icon={faAnglesRight} />
              </span>
            </button>
          </aside>
        </div>
      )}
    </>
  );
}

export default ChartWrapper;
