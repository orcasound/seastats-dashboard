import DailyDetectionsChart from "../charts/DailyDetectionsChart";
import AcousticEventsChart from "../charts/AcousticEventsChart";
import SoundLevelChart from "../charts/SoundLevelChart";
import Navigation from "./Navigation";
import { useState, useLayoutEffect, useContext } from "react";
import StaticGraphicChart from "../charts/StaticGraphicChart";
import RecordingConsistencyChart from "../charts/RecordingConsistencyChart";
import StationStatus from "./StationStatus";
import useAppPassword from "../hooks/useAppPassword";
import { Settings } from "../context/Settings";
import { AppState } from "../context/AppState";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesLeft } from "@fortawesome/free-solid-svg-icons";
import SummaryChart from "../charts/SummaryChart";
import { defaultLogoSrc } from "../utils/helpers";

const chartComponents = {
  SummaryChart,
  DailyDetectionsChart,
  AcousticEventsChart,
  StaticGraphicChart,
  SoundLevelChart,
  RecordingConsistencyChart,
};

const chartDataPointTypeForDateRange = {
  SummaryChart: {
    property: "dataPointType",
    value: "recordingCoverage",
  },
  DailyDetectionsChart: {
    property: "dataPointType",
    value: "callRate",
  },
  AcousticEventsChart: {
    property: "dataPointType",
    value: "recordingCoverage",
  },
  StaticGraphicChart: {
    property: "uploadType",
  },
  SoundLevelChart: {
    property: "dataPointType",
    value: "exceedance",
  },
  RecordingConsistencyChart: {
    property: "dataPointType",
    value: "recordingCoverage",
  },
};

function AppLayout() {
  const { stationData, charts, layoutMode, styles } = useContext(Settings);
  const [navOpen, setNavOpen] = useState(layoutMode === "desktop");
  const { password, PasswordForm } = useAppPassword();
  const showPasswordForm = !stationData?.public && !password;

  if (!stationData?.dataSummary?.length) {
    throw new Error("No data available for this station.");
  }

  const filteredCharts = charts
    .map((chart) => {
      let { property, value } = chartDataPointTypeForDateRange[chart.component];
      if (property === "uploadType") value = chart.uploadType;
      const summaryPropertyMap = {
        dataPointType: "dataSummary",
        uploadType: "uploadSummary",
      };
      return {
        ...chart,
        ...stationData[summaryPropertyMap[property]].find(
          (summary) => summary[property] === value
        ),
        componentName: chart.component,
        component: chartComponents[chart.component],
      };
    })
    .filter(
      ({ dataPointType, count, minDate }) =>
        dataPointType === "" || minDate || count
    );

  if (filteredCharts.length === 0) {
    throw new Error("No valid data available for this station.");
  }

  const [selectedChartIndex, setSelectedChartIndex] = useState(0);

  useLayoutEffect(() => {
    // Close the nav when the selected page changes
    if (layoutMode === "mobile") setNavOpen(false);
  }, [selectedChartIndex]);

  useLayoutEffect(() => {
    // Reset the nav when the layout mode changes
    if (layoutMode === "mobile") {
      setNavOpen(false);
    } else {
      setNavOpen(true);
    }
  }, [layoutMode]);

  useLayoutEffect(() => {
    // Force the Plotly charts to resize when the window is resized
    window.dispatchEvent(new Event("resize"));
  }, [navOpen]);

  const selectedChart = filteredCharts[selectedChartIndex];
  const { component: ActiveChartComponent } = selectedChart;

  const appClasses = (() => {
    const classes = [
      "ss_App",
      `${layoutMode}-layout`,
      `${styles}-styles`,
      `chart-${selectedChart.componentName}`,
    ];

    if (navOpen) {
      classes.push("nav-open");
    }

    return classes.join(" ");
  })();

  function handleSidebarWrapperClick(event) {
    // Close the nav if the user clicks directly on this element
    if (layoutMode === "mobile" && event.target === event.currentTarget) {
      setNavOpen(false);
    }
  }

  return (
    <AppState.Provider
      value={{
        navOpen,
        setNavOpen,
        selectedChart,
      }}
    >
      <article className={appClasses}>
        {layoutMode && showPasswordForm && <PasswordForm />}
        {layoutMode && !showPasswordForm && (
          <>
            <aside
              className="ss_SidebarWrapper"
              onClick={handleSidebarWrapperClick}
            >
              <div className="ss_Sidebar">
                <div className="ss_stationInfo">
                  <img
                    alt={
                      stationData.logoUrl
                        ? stationData.organizationName
                        : "SeaStats"
                    }
                    src={
                      stationData.logoUrl ? stationData.logoUrl : defaultLogoSrc
                    }
                  />
                  <StationStatus />
                </div>
                <Navigation
                  charts={filteredCharts}
                  selectedIndex={selectedChartIndex}
                  setSelectedIndex={setSelectedChartIndex}
                />
                <button
                  className="ss_close"
                  onClick={() => {
                    setNavOpen(false);
                  }}
                >
                  <span className="ss_iconLeft">
                    <FontAwesomeIcon icon={faAnglesLeft} fixedWidth />
                  </span>
                  Close Menu
                </button>
              </div>
            </aside>
            <ActiveChartComponent {...selectedChart} key={selectedChartIndex} />
          </>
        )}
      </article>
    </AppState.Provider>
  );
}

export default AppLayout;
