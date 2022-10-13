import { recordingCoverageWithMeta } from "../utils/helpers";
import withChartData from "../hoc/withChartData";
import RecordingConsistencyChartLayout from "./RecordingConsistencyChartLayout";

const RecordingConsistencyChart = withChartData(
  RecordingConsistencyChartLayout,
  {
    dataPointTypes: [`recordingCoverage`],
    chartDataFromResponses: (responses, { fromDate, toDate } = {}) => {
      const [recordingCoverageResult] = responses;
      return recordingCoverageWithMeta(
        recordingCoverageResult.data,
        fromDate,
        toDate
      );
    },
  }
);

export default RecordingConsistencyChart;
