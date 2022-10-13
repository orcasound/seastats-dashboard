import { useState } from "react";
import PlotlyChart from "../components/PlotlyChart";
import { PlotlyLayout, axisTitle } from "../utils/plotly";
import {
  colorForValue,
  hoverTemplateStrings,
  recordingCoverageBinaryChartConfig,
} from "../utils/helpers";
import { round } from "../utils/math";
import useSmoothing from "../hooks/useSmoothing";
import DateRangeControls from "../components/filter/DateRangeControls";

function getBandData(chartData, bandTitle) {
  return chartData.find(({ band }) => band === bandTitle);
}

function getExceedenceData(chartData, bandTitle, thresholdTitle) {
  return getBandData(chartData, bandTitle)?.exceedance.find(
    ({ threshold }) => threshold === thresholdTitle
  )?.rows;
}

function SoundLevelChartLayout({
  title = "",
  minDate = "",
  maxDate = "",
  fromDate = "",
  toDate = "",
  chartData = {},
  onChangeDateRange = () => {},
}) {
  const { soundLevelData, recordingCoverageData } = chartData;
  const bands = soundLevelData.map(({ band }) => band);
  const [selectedBand, setSelectedBand] = useState(bands[0]);
  const metrics = ["Sound pressure level", "Exceedance"];
  const [selectedMetric, setSelectedMetric] = useState(metrics[0]);
  const thresholds = soundLevelData[0].exceedance.map(
    ({ threshold }) => threshold
  );
  const [selectedThreshold, setSelectedThreshold] = useState(thresholds[0]);

  const selectedChartData =
    selectedMetric === "Sound pressure level"
      ? getBandData(soundLevelData, selectedBand).noise
      : getExceedenceData(soundLevelData, selectedBand, selectedThreshold);

  const {
    smoothingControls,
    smooth,
    plotlySmoothedLineConfig,
    averageWeeksNotation,
  } = useSmoothing();
  const smoothedData = smooth(selectedChartData, "date", "value");
  const range = (() => {
    // For noise we don't want to start at zero
    if (selectedMetric !== "Sound pressure level") return undefined;
    const sortedValues = smoothedData
      .map((row) => row.value)
      .filter((value) => typeof value === "number")
      .sort((a, b) => a - b);
    const minValue = sortedValues[0];
    const maxValue = sortedValues.at(-1);
    const minMaxDiff = maxValue - minValue;
    const buffer = minMaxDiff * 0.1;
    return [Math.max(0, minValue - buffer), maxValue + buffer];
  })();

  const plotlyData = [
    recordingCoverageBinaryChartConfig(recordingCoverageData, true),
    {
      ...plotlySmoothedLineConfig(),
      x: smoothedData.map((row) => row.date),
      y: smoothedData.map((row) => row.value),
      name: `${selectedBand}${
        selectedMetric === "Sound pressure level"
          ? ""
          : `: ${selectedThreshold}`
      }`,
    },
  ];

  const noiseControls = (
    <>
      <label>
        Band:
        <br />
        <select
          value={selectedBand}
          onChange={(e) => setSelectedBand(e.target.value)}
        >
          {bands.map((title) => (
            <option value={title} key={title}>
              {title}
            </option>
          ))}
        </select>
      </label>
      <label>
        Metric:
        <br />
        <select
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value)}
        >
          {metrics.map((title) => (
            <option value={title} key={title}>
              {title}
            </option>
          ))}
        </select>
      </label>
      {selectedMetric === "Exceedance" && (
        <label>
          Threshold:
          <br />
          <select
            value={selectedThreshold}
            onChange={(e) => setSelectedThreshold(e.target.value)}
          >
            {thresholds.map((title) => (
              <option value={title} key={title}>
                {title}
              </option>
            ))}
          </select>
        </label>
      )}
    </>
  );

  // const filteredRecordingCoverageData = recordingCoverageData.filter(
  //   matchDateRangeFilter(filteredCallData[0].rows)
  // );

  return (
    <PlotlyChart
      // this key ensures the range slider resets when the date range changes
      key={`${fromDate}-${toDate}`}
      title={`${title}: ${selectedMetric}`}
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
          {noiseControls}
          {smoothingControls}
        </>
      }
      layout={{
        ...new PlotlyLayout(),
        yaxis: {
          automargin: true,
          showgrid: false,
          tickformat:
            selectedMetric === "Sound pressure level" ? undefined : ",.0%",
          title: axisTitle(
            selectedMetric === "Sound pressure level" ? "dB re 1μPa" : undefined
          ),
          range: range,
        },
      }}
      // ToDo: Daily summary needs to show smoothed values and probably use a subset of recording coverage data
      dailySummary={{
        customdata: selectedChartData.map((row, index) => ({
          ...recordingCoverageData[index],
          ...row,
          roundedValue:
            selectedMetric === "Sound pressure level"
              ? round(row.value, 1)
              : round(row.value * 100, 0),
          roundedValueTextColor: colorForValue(
            selectedMetric === "Sound pressure level" ? 0.5 : 1 - row.value
          ),
        })),
        hovertemplate: [
          `<b>${hoverTemplateStrings.date}${averageWeeksNotation}</b>`,
          selectedMetric === "Sound pressure level"
            ? "Sound level: <b>%{customdata.roundedValue}</b> (dB re 1μPa)"
            : 'Exceedance time: <b style="color: %{customdata.roundedValueTextColor}">%{customdata.roundedValue}%</b>',
          hoverTemplateStrings.recordingCoverage,
          `<extra></extra>`,
        ].join("<br>"),
      }}
    />
  );
}

export default SoundLevelChartLayout;
