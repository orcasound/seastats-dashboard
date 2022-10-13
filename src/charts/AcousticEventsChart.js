import { recordingCoverageWithMeta, sunAndMoonData } from "../utils/helpers";
import withChartData from "../hoc/withChartData";
import { getAdjustedDateRange, restructureCallEventData } from "../utils/data";
import AcousticEventsChartLayout from "./AcousticEventsChartLayout";

const AcousticEventsChart = withChartData(AcousticEventsChartLayout, {
  dataPointTypes: [`recordingCoverage`, `callEvent`],
  chartDataFromResponses: (responses, { fromDate, toDate, settings } = {}) => {
    const [recordingCoverageResult, callEventResult] = responses;
    const callEventData = restructureCallEventData(
      callEventResult.data,
      settings
    );
    // Account for time zone slippage
    const { adjustedMinDate, adjustedMaxDate } = getAdjustedDateRange(
      callEventResult.data,
      settings
    );
    const minDate =
      adjustedMinDate && adjustedMinDate < fromDate
        ? adjustedMinDate
        : fromDate;
    const maxDate =
      adjustedMaxDate && adjustedMaxDate > toDate ? adjustedMaxDate : toDate;
    const recordingCoverageData = recordingCoverageWithMeta(
      recordingCoverageResult.data,
      minDate,
      maxDate
    );
    const illuminationData = sunAndMoonData(minDate, maxDate, {
      timeZone: settings.stationData.timeZone,
      lat: settings.stationData.latitude,
      lon: settings.stationData.longitude,
    });
    const detectionsByDate = callEventData
      .map(({ rows }) => rows)
      .flat()
      .reduce((result, { date, callCount }) => {
        result[date] = {
          numEvents: (result[date]?.numEvents || 0) + 1,
          numCalls: (result[date]?.numCalls || 0) + callCount,
        };
        return result;
      }, {});
    const dailySummaryCustomData = recordingCoverageData.map((row, index) => {
      const formatTime = (hours24float) => {
        const am = hours24float > 12 ? false : true;
        const hoursFloat = hours24float > 12 ? hours24float - 12 : hours24float;
        const minutes = Math.floor((hoursFloat % 1) * 60);
        const hours = Math.floor(hoursFloat);
        return `${hours}:${`${minutes}`.padStart(2, "0")} ${am ? "AM" : "PM"}`;
      };
      return {
        ...row,
        ...illuminationData[index],
        detections: {
          numEvents: detectionsByDate[row.date]?.numEvents || 0,
          numCalls: detectionsByDate[row.date]?.numCalls || 0,
        },
        sunrise: formatTime(illuminationData[index].sunrise),
        sunset: formatTime(illuminationData[index].sunset),
      };
    });
    return {
      callEventData: callEventData.map((item) => {
        return {
          ...item,
          rows: item.rows.map((item) => {
            return {
              // Add the daily customdata for the hovertemplate
              ...dailySummaryCustomData.find((row) => row.date === item.date),
              ...item,
            };
          }),
        };
      }),
      recordingCoverageData,
      illuminationData,
      dailySummaryCustomData,
    };
  },
});

export default AcousticEventsChart;
