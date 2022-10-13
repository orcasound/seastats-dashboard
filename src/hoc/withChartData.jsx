import { useContext, useState } from "react";
import useApi from "../hooks/useApi";
import LoadingSpinner from "../components/basic/LoadingSpinner";
import ErrorMessage from "../components/basic/ErrorMessage";
import LoadingOverlay from "../components/basic/LoadingOverlay";
import { addDays, formatISO, max, parseISO, subYears } from "date-fns";
import { Settings } from "../context/Settings";

function withChartData(
  ChartComponent,
  { dataPointTypes = [], chartDataFromResponses = () => {} }
) {
  return ({ minDate = "", maxDate = "", ...chartProps }) => {
    const settings = useContext(Settings);
    const { stationData } = settings;
    // Start with the last 12 months of data if available
    const initialFromDate = formatISO(
      max([addDays(subYears(parseISO(maxDate), 1), 1), parseISO(minDate)]),
      {
        representation: "date",
      }
    );
    const [fromDate, setFromDate] = useState(initialFromDate);
    const [toDate, setToDate] = useState(maxDate);
    const [nextFromDate, setNextFromDate] = useState(fromDate);
    const [nextToDate, setNextToDate] = useState(toDate);

    const [chartData, setChartData] = useState();
    const requests = dataPointTypes.map(
      (type) =>
        `data/${stationData.organizationKey}/${stationData.stationKey}?dataPointType=${type}&fromDate=${nextFromDate}&toDate=${nextToDate}`
    );
    const onComplete = (responses, errorMsg) => {
      setChartData(
        errorMsg
          ? null
          : chartDataFromResponses(responses, {
              fromDate: nextFromDate,
              toDate: nextToDate,
              settings,
            })
      );
      setFromDate(nextFromDate);
      setToDate(nextToDate);
    };
    const { loadingData, updatingData, errorMsg, responses } = useApi(
      requests,
      onComplete,
      [nextFromDate, nextToDate]
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
          fromDate={fromDate}
          toDate={toDate}
          minDate={minDate}
          maxDate={maxDate}
          onChangeDateRange={(fromDate, toDate) => {
            setNextFromDate(fromDate);
            setNextToDate(toDate);
          }}
        />
      </>
    );
  };
}

export default withChartData;
