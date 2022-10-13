import { formatDistanceToNowStrict } from "date-fns";
import StatusIndicator from "./StatusIndicator";
import { useContext } from "react";
import { Settings } from "../context/Settings";

function StationStatus() {
  const { stationData } = useContext(Settings);
  const { name, updated, online, sidebarText, organizationName } = stationData;
  const lastUpdated = new Date(updated).getTime();
  const lastUpdatedDuration = Date.now() - lastUpdated;

  const statuses = ["good", "warn", "bad"];

  const lastUpdatedStatusWarnLevel = (() => {
    if (lastUpdatedDuration < 24 * 60 * 60 * 1000) return 0;
    if (lastUpdatedDuration < 48 * 60 * 60 * 1000) return 1;
    return 2;
  })();

  const recordingStatusWarnLevel = online ? 0 : 2;

  const stationStatusWarnLevel = Math.max(
    lastUpdatedStatusWarnLevel,
    recordingStatusWarnLevel
  );

  const sidebarTextItems =
    Array.isArray(sidebarText) && sidebarText.length
      ? sidebarText
      : [
          {
            label: "Network",
            text: organizationName,
          },
          {
            label: "Station",
            text: name,
          },
        ];

  return (
    <div className="ss_StationStatus">
      <ul className="ss_sidebarText">
        {sidebarTextItems.map(({ label, text }, index) => (
          <li key={index}>
            {label && <b>{label}:</b>} {text}
          </li>
        ))}
      </ul>
      <ul className="ss_status">
        <li>
          <b>Updated:</b>{" "}
          <StatusIndicator status={statuses[lastUpdatedStatusWarnLevel]} />{" "}
          {formatDistanceToNowStrict(lastUpdated)} ago
        </li>
        <li>
          <b>Status:</b>{" "}
          <StatusIndicator status={statuses[stationStatusWarnLevel]} />{" "}
          {stationStatusWarnLevel == 2 ? "Offline" : "Online"}
        </li>
      </ul>
    </div>
  );
}

export default StationStatus;
