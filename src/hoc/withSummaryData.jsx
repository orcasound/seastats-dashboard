import { useContext, useState } from "react";
import useApi from "../hooks/useApi";
import LoadingSpinner from "../components/basic/LoadingSpinner";
import ErrorMessage from "../components/basic/ErrorMessage";
import LoadingOverlay from "../components/basic/LoadingOverlay";
import { Settings } from "../context/Settings";

function getNoiseData(data) {
  const filteredData = data.filter((item) => typeof item.value === "number");
  if (!filteredData.length) {
    return null;
  }
  const oldest = filteredData.at(1);
  const latest = filteredData.at(-1);
  return {
    oldest,
    latest,
    percentile:
      (filteredData.filter(({ value }) => value <= latest.value).length /
        filteredData.length) *
      100,
  };
}

function withSummaryData(ChartComponent) {
  return ({ minDate = "", maxDate = "", ...chartProps }) => {
    const settings = useContext(Settings);
    const { stationData } = settings;
    const latestEventDate =
      stationData.dataSummary.find(
        ({ dataPointType }) => dataPointType === "callEvent"
      )?.maxDate || maxDate;

    const [chartData, setChartData] = useState();
    const requests = [
      `data/${stationData.organizationKey}/${stationData.stationKey}?dataPointType=callEvent&fromDate=${latestEventDate}&toDate=${latestEventDate}`,
      `data/${stationData.organizationKey}/${stationData.stationKey}?dataPointType=noise&fromDate=${minDate}&toDate=${maxDate}&band=100-1000%20Hz`,
    ];
    const onComplete = (responses, errorMsg) => {
      setChartData(
        errorMsg
          ? null
          : {
              callEventData: responses[0].data,
              noiseData: getNoiseData(responses[1].data),
            }
      );
    };
    const { loadingData, updatingData, errorMsg, responses } = useApi(
      requests,
      onComplete,
      []
    );

    if (loadingData) return <LoadingSpinner />;

    if (errorMsg) return <ErrorMessage message={errorMsg} />;

    return (
      <>
        {updatingData && <LoadingOverlay />}
        <ChartComponent
          {...chartProps}
          chartData={chartData}
          updating={updatingData}
          minDate={minDate}
          maxDate={maxDate}
        />
      </>
    );
  };
}

export default withSummaryData;
