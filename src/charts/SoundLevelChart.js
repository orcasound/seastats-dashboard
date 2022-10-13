import { recordingCoverageWithMeta } from "../utils/helpers";
import withChartData from "../hoc/withChartData";
import { backfillData } from "../utils/data";
import SoundLevelChartLayout from "./SoundLevelChartLayout";

function restructureSoundLevelData(
  exceedanceData,
  noiseData,
  fromDate,
  toDate
) {
  // Group in to a nested structure
  const result = [];
  exceedanceData.map(({ band, date, threshold, value }) => {
    const bandIndex = result.findIndex((row) => row.band === band);
    if (bandIndex === -1) {
      result.push({
        band,
        exceedance: [
          {
            threshold,
            rows: [{ date, value }],
          },
        ],
      });
    } else {
      const thresholdIndex = result[bandIndex].exceedance.findIndex(
        (row) => row.threshold === threshold
      );
      if (thresholdIndex === -1) {
        result[bandIndex].exceedance.push({
          threshold,
          rows: [{ date, value }],
        });
      } else {
        result[bandIndex].exceedance[thresholdIndex].rows.push({
          date,
          value,
        });
      }
    }
  });
  noiseData.map(({ band, date, value }) => {
    const bandIndex = result.findIndex((row) => row.band === band);
    if (bandIndex === -1) {
      result.push({
        band,
        noise: [{ date, value }],
      });
    } else if (result[bandIndex].noise) {
      result[bandIndex].noise.push({
        date,
        value,
      });
    } else {
      result[bandIndex].noise = [{ date, value }];
    }
  });
  // Add any missing values for the date range
  result.forEach((bandRow) => {
    bandRow.exceedance.forEach((thresholdRow) => {
      thresholdRow.rows = backfillData(thresholdRow.rows, fromDate, toDate);
    });
    bandRow.noise = backfillData(bandRow.noise, fromDate, toDate);
  });

  return result;
}

const SoundLevelChart = withChartData(SoundLevelChartLayout, {
  dataPointTypes: [`recordingCoverage`, `exceedance`, `noise`],
  chartDataFromResponses: (responses, { fromDate, toDate } = {}) => {
    const [recordingCoverageResult, exceedanceResult, noiseResult] = responses;
    return {
      soundLevelData: restructureSoundLevelData(
        exceedanceResult.data,
        noiseResult.data,
        fromDate,
        toDate
      ),
      recordingCoverageData: recordingCoverageWithMeta(
        recordingCoverageResult.data,
        fromDate,
        toDate
      ),
    };
  },
});

export default SoundLevelChart;
