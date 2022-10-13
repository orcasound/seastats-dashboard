import "./styles/layout.css";
import "./styles/theme.css";
import { useRef } from "react";
import AppLayout from "./components/AppLayout";
import useApi from "./hooks/useApi";
import LoadingSpinner from "./components/basic/LoadingSpinner";
import { Settings } from "./context/Settings";
import { getChartColorFunc } from "./utils/colors";
import useLayoutMode from "./hooks/useLayoutMode";

function App({ organizationKey = "", stationKey = "", options = {} }) {
  // Determine the layout mode based on the width of the container
  const containerRef = useRef(null);
  const layoutMode = useLayoutMode(containerRef);

  if (!organizationKey || !stationKey) {
    throw new Error("Missing organizationKey or stationKey");
  }

  // Get the basic data needed for all charts
  const { loadingData, errorMsg, responses } = useApi(
    [
      `station/${organizationKey}/${stationKey}`,
      `organization/${organizationKey}`,
    ],
    undefined,
    []
  );

  function renderApp() {
    if (errorMsg) throw new Error(errorMsg);
    if (loadingData || !layoutMode) return <LoadingSpinner />;
    const stationData = responses?.[0]?.data;
    const organizationData = responses?.[1]?.data;
    return (
      <Settings.Provider
        value={{
          ...options,
          stationData: {
            ...stationData,
            logoUrl: stationData?.logoUrl || organizationData?.logoUrl,
            public: organizationData?.public,
            organizationName: organizationData?.name,
          },
          layoutMode,
          chartColor: getChartColorFunc(options.chartColors),
        }}
      >
        <AppLayout />
      </Settings.Provider>
    );
  }

  return (
    <div className="ss_AppContainer" ref={containerRef}>
      {renderApp()}
    </div>
  );
}

export default App;
