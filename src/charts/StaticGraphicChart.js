import withChartUploads from "../hoc/withChartUploads";
import StaticGraphicChartLayout from "./StaticGraphicChartLayout";

const StaticGraphicChart = withChartUploads(StaticGraphicChartLayout, {
  chartUploadsFromResponses: (responses) => responses[0].data,
});

export default StaticGraphicChart;
