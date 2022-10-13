import PlotlyChart from "../components/PlotlyChart";
import { PlotlyLayout, axisTitle } from "../utils/plotly";
import {
  callKey,
  hoverTemplateStrings,
  matchDateRangeFilter,
  recordingCoverageBinaryChartConfig,
} from "../utils/helpers";
import { round } from "../utils/math";
import useSmoothing from "../hooks/useSmoothing";
import DateRangeControls from "../components/filter/DateRangeControls";
import useSelectedCallTypes from "../hooks/useSelectedCallTypes";
import CallOptionsControls from "../components/filter/CallOptionsControls";
import Color from "color";

function callLabel(species, callType) {
  return `${species}: ${callType}`;
}

function DailyDetectionsChartLayout({
  title = "",
  minDate = "",
  maxDate = "",
  fromDate = "",
  toDate = "",
  chartData = {},
  onChangeDateRange = () => {},
}) {
  const {
    smoothing,
    smoothingControls,
    smooth,
    plotlySmoothedLineConfig,
    averageWeeksNotation,
  } = useSmoothing();

  const smoothedData = chartData.callRateData.map((row) => ({
    ...row,
    rows: smooth(row.rows, "date", "callRate"),
  }));

  const { filteredData, setSelectedCallTypes } =
    useSelectedCallTypes(smoothedData);

  const filteredRecordingCoverageData = chartData.recordingCoverageData.filter(
    matchDateRangeFilter(filteredData[0].rows)
  );

  const plotlyData = [
    recordingCoverageBinaryChartConfig(chartData.recordingCoverageData, true),
  ];

  if (!smoothing) {
    filteredData.forEach(({ rows, species, callType, markerColor }, index) => {
      plotlyData.push({
        x: rows.map((row) => row.date),
        y: rows.map((row) => row.callRate),
        type: "bar",
        marker: { color: markerColor },
        name: callLabel(species, callType),
        hovertemplate: "",
        hoverinfo: "skip",
      });
    });
  } else {
    filteredData.forEach(({ rows, species, callType, markerColor }, index) => {
      const config = {
        ...plotlySmoothedLineConfig(),
        x: rows.map((row) => row.date),
        y: rows.map((row) => row.callRate),
        name: callLabel(species, callType),
        hovertemplate: "",
        hoverinfo: "skip",
      };
      config.line.color = markerColor;
      const color = Color(markerColor);
      config.fillcolor = color.alpha(0.1).rgb().string();
      plotlyData.push(config);
    });
  }

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
          <CallOptionsControls
            data={smoothedData}
            onChangeSelectedCallTypes={setSelectedCallTypes}
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
          title: axisTitle("Detections / 24h"),
        },
        barmode: "stack",
      }}
      dailySummary={{
        customdata: filteredData[0].rows.map((row, index) => ({
          ...filteredRecordingCoverageData[index],
          date: row.date,
          ...Object.fromEntries(
            filteredData.map(({ species, callType, rows, markerColor }) => [
              callKey(species, callType),
              { callRate: round(rows[index].callRate, 1), markerColor },
            ])
          ),
        })),
        hovertemplate: [
          `<b>${hoverTemplateStrings.date}${averageWeeksNotation}</b>`,
          ...filteredData.map(
            ({ species, callType, rows }) =>
              `${callLabel(
                species,
                callType
              )}: <b style="color: %{customdata.${callKey(
                species,
                callType
              )}.markerColor}">%{customdata.${callKey(
                species,
                callType
              )}.callRate} / 24h</b>`
          ),
          hoverTemplateStrings.recordingCoverage,
          `<extra></extra>`,
        ].join("<br>"),
      }}
    />
  );
}

export default DailyDetectionsChartLayout;
