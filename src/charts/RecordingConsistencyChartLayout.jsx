import useSmoothing from "../hooks/useSmoothing";
import DateRangeControls from "../components/filter/DateRangeControls";
import PlotlyChart from "../components/PlotlyChart";
import { PlotlyLayout } from "../utils/plotly";
import {
  hoverTemplateStrings,
  recordingCoverageWithMeta,
} from "../utils/helpers";
import { useContext } from "react";
import { Settings } from "../context/Settings";

function RecordingConsistencyChartLayout({
  title = "",
  minDate = "",
  maxDate = "",
  fromDate = "",
  toDate = "",
  chartData = [],
  onChangeDateRange = () => {},
}) {
  const { chartColor } = useContext(Settings);
  const {
    smoothingControls,
    smooth,
    plotlySmoothedLineConfig,
    averageWeeksNotation,
  } = useSmoothing();
  const smoothedData = smooth(chartData, "date", "recordingCoverage");

  const plotlyData = [
    {
      ...plotlySmoothedLineConfig(),
      x: smoothedData.map((row) => row.date),
      y: smoothedData.map((row) => row.recordingCoverage),
      type: "scatter",
      mode: "lines",
      stackgroup: "one",
      marker: { color: chartColor(0) },
      name: "Recording consistency",
      hovertemplate: "",
      hoverinfo: "skip",
    },
  ];

  return (
    <PlotlyChart
      // this key ensures the range slider resets when the date range changes
      key={`${fromDate}-${toDate}`}
      title={title}
      data={plotlyData}
      settingsControls={
        <>
          <DateRangeControls
            fromDate={fromDate}
            toDate={toDate}
            minDate={minDate}
            maxDate={maxDate}
            onChangeDateRange={onChangeDateRange}
          />
          {smoothingControls}
        </>
      }
      layout={{
        ...new PlotlyLayout(),
        bargap: 0.3,
        yaxis: {
          automargin: true,
          showgrid: false,
          tickformat: ",.0%",
        },
      }}
      dailySummary={{
        customdata: recordingCoverageWithMeta(smoothedData),
        hovertemplate: [
          `<b>${hoverTemplateStrings.date}${averageWeeksNotation}</b>`,
          hoverTemplateStrings.recordingCoverage,
          `<extra></extra>`,
        ].join("<br>"),
      }}
    />
  );
}

export default RecordingConsistencyChartLayout;
