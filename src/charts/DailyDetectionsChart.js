import { recordingCoverageWithMeta } from "../utils/helpers";
import withChartData from "../hoc/withChartData";
import { backfillData } from "../utils/data";
import DailyDetectionsChartLayout from "./DailyDetectionsChartLayout";

function restructureCallRateData(data, fromDate, toDate, settings) {
  // Group in to a nested structure
  const nested = [];
  data.map(({ species, date, callType, value }) => {
    const speciesIndex = nested.findIndex((row) => row.species === species);
    if (speciesIndex === -1) {
      nested.push({
        species,
        calls: [
          {
            callType,
            rows: [{ date, callRate: value }],
          },
        ],
      });
    } else {
      const callIndex = nested[speciesIndex].calls.findIndex(
        (row) => row.callType === callType
      );
      if (callIndex === -1) {
        nested[speciesIndex].calls.push({
          callType,
          rows: [{ date, callRate: value }],
        });
      } else {
        nested[speciesIndex].calls[callIndex].rows.push({
          date,
          callRate: value,
        });
      }
    }
  });

  // Sort to ensure colours are consistent
  nested.sort((a, b) => a.species.localeCompare(b.species));
  nested.forEach((speciesRow) => {
    speciesRow.calls.sort((a, b) => a.callType.localeCompare(b.callType));
  });

  // Partially flatten, and add a colour for each call type
  const flattened = [];
  nested.forEach((speciesRow, speciesIndex) => {
    speciesRow.calls.forEach((callsRow, callsIndex) => {
      flattened.push({
        ...callsRow,
        rows: backfillData(callsRow.rows, fromDate, toDate),
        species: speciesRow.species,
        markerColor: settings.chartColor(speciesIndex, callsIndex),
      });
    });
  });

  return flattened;
}

const DailyDetectionsChart = withChartData(DailyDetectionsChartLayout, {
  dataPointTypes: [`recordingCoverage`, `callRate`],
  chartDataFromResponses: (responses, { fromDate, toDate, settings } = {}) => {
    const [recordingCoverageResult, callRateResult] = responses;
    return {
      callRateData: restructureCallRateData(
        callRateResult.data,
        fromDate,
        toDate,
        settings
      ),
      recordingCoverageData: recordingCoverageWithMeta(
        recordingCoverageResult.data,
        fromDate,
        toDate
      ),
    };
  },
});

export default DailyDetectionsChart;
