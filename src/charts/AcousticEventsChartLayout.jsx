import { useContext, useState } from "react";
import {
  formatDateLong,
  hoverTemplateStrings,
  recordingCoverageBinaryChartConfig,
} from "../utils/helpers";
import { PlotlyLayout } from "../utils/plotly";
import PlotlyChart from "../components/PlotlyChart";
import DateRangeControls from "../components/filter/DateRangeControls";
import useSelectedCallTypes from "../hooks/useSelectedCallTypes";
import CallOptionsControls from "../components/filter/CallOptionsControls";
import SettingsGroup from "../components/basic/SettingsGroup";
import CheckboxLabel from "../components/basic/CheckboxLabel";
import SpeciesIcon from "../components/basic/SpeciesIcon";
import { Settings } from "../context/Settings";
import speciesIconSvgs from "../components/basic/speciesIconSvgs";

const maxMarkerSize = 30;
const minMarkerSize = 6;
const maxFrequencies = {
  default: 4000,
  Orca: 8000,
  Humpback: 4000,
  Fin: 2000,
};
const fftSamples = {
  default: 4096,
  Orca: 4096,
  Humpback: 8192,
  Fin: 4096,
};

function getMarkerSize(callCount, { min, max }) {
  const adjustedCallCount = callCount - min + 1;
  const adjustedMax = max - min + 1;
  const portion = adjustedCallCount / adjustedMax;
  return minMarkerSize + portion * (maxMarkerSize - minMarkerSize);
}

function AcousticEventsChartLayout({
  title = "",
  minDate = "",
  maxDate = "",
  fromDate = "",
  toDate = "",
  chartData = {},
  onChangeDateRange = () => {},
}) {
  const [sunInfo, setSunInfo] = useState(true);
  const [moonInfo, setMoonInfo] = useState(true);
  const [showRecordingGaps, setShowRecordingGaps] = useState(true);
  const [selectedCallEvent, setSelectedCallEvent] = useState(null);

  const {
    callEventData,
    illuminationData,
    recordingCoverageData,
    dailySummaryCustomData,
  } = chartData;

  // Filter data
  const { filteredData, setSelectedCallTypes } =
    useSelectedCallTypes(callEventData);

  const sunProps = {
    x: illuminationData.map((row) => row.date),
    type: "scatter",
    mode: "lines",
    line: { color: "orange", width: 0 },
    fillcolor: "rgba(0,0,0,0.1)",
    marker: { color: "yellow" },
    showlegend: false,
    hovertemplate:
      "%{x|%a %b %-d}" + '<extra><b style="color: black">%{text}</b></extra>',
  };

  function hourToTime(hour) {
    const hours = `${Math.floor(hour)}`.padStart(2, "0");
    const minutes = `${Math.floor((hour % 1) * 60)}`.padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  const plotlyData = [
    recordingCoverageBinaryChartConfig(
      recordingCoverageData,
      showRecordingGaps
    ),
    {
      ...sunProps,
      y: illuminationData.map((row) => row.sunrise),
      fill: "tozeroy",
      name: "Sunrise",
      hovertemplate: `Sunrise ${sunProps.hovertemplate}`,
      text: illuminationData.map((row) => hourToTime(row.sunrise)),
      visible: sunInfo,
    },
    {
      ...sunProps,
      y: illuminationData.map((row) => 24),
      fill: "none",
      name: "",
      hoverinfo: "skip",
      hovertemplate: "",
      visible: sunInfo,
    },
    {
      ...sunProps,
      y: illuminationData.map((row) => row.sunset),
      fill: "tonexty",
      name: "Sunset",
      hovertemplate: `Sunset ${sunProps.hovertemplate}`,
      text: illuminationData.map((row) => hourToTime(row.sunset)),
      visible: sunInfo,
    },
    {
      ...sunProps,
      y: illuminationData.map((row) => row.moonFraction - 2),
      fill: "tozeroy",
      name: "Moon fraction",
      text: illuminationData.map((row) => hourToTime(row.sunrise)),
      customdata: dailySummaryCustomData,
      visible: moonInfo,
      hovertemplate:
        "%{x|%a %b %-d}" +
        '<extra><b style="color: black">%{customdata.moonEmoji}</b></extra>',
    },
    {
      ...sunProps,
      fillcolor: "#fffcd5",
      y: illuminationData.map((row) => -2),
      fill: "tonexty",
      hoverinfo: "skip",
      hovertemplate: "",
      visible: moonInfo,
    },
    ...filteredData.map(getDetectionChartSettings),
  ];

  function getDetectionChartSettings({
    species,
    markerColor,
    rows,
    callType,
    callCountRange,
  }) {
    const label = `${species} ${callType}`;
    return {
      x: rows.map(({ date }) => date),
      y: rows.map(({ eventHour }) => eventHour),
      customdata: rows,
      mode: "markers",
      marker: {
        size: rows.map(({ callCount }) =>
          getMarkerSize(callCount, callCountRange)
        ),
        color: markerColor,
      },
      hovertemplate: [
        `<b>${label} detection</b>`,
        `%{customdata.timeFrom} – %{customdata.timeTo} (%{customdata.durationText})`,
        `<b>%{customdata.callCount}</b> calls  <b>%{customdata.callsPerMinute:.1f}</b> calls/m`,
        `<br><b>${hoverTemplateStrings.date}</b>`,
        // hoverTemplateStrings.detectionSummary,
        hoverTemplateStrings.recordingCoverage,
        hoverTemplateStrings.lunarAndSolar,
        `<extra></extra>`,
      ].join("<br>"),
      name: label,
    };
  }

  function renderModalContent() {
    if (!selectedCallEvent) return null;
    const {
      date,
      species,
      callType,
      timeFrom,
      timeTo,
      callCount,
      callsPerMinute,
      durationText,
      markerColor,
    } = selectedCallEvent;

    return (
      <div className="ss_AcousticEventDetail">
        <div
          className={`ss_stats${
            speciesIconSvgs[species] ? " ss_withIcon" : ""
          }`}
        >
          <h3>
            {species} {callType} Event
          </h3>
          <div className="ss_species">
            <SpeciesIcon species={species} />
          </div>
          <div>
            <p className="ss_date ss_subTitle">{formatDateLong(date)}</p>
            <p className="ss_time ss_subTitle">
              {timeFrom} – {timeTo} ({durationText})
            </p>
            <p className="ss_callsTotal">{callCount} calls</p>
          </div>
        </div>
      </div>
    );
  }

  const overlayControls = (
    <SettingsGroup title="Overlays">
      <CheckboxLabel>
        <input
          type="checkbox"
          checked={sunInfo}
          onChange={(e) => setSunInfo(e.currentTarget.checked)}
        />
        Sun
      </CheckboxLabel>
      <CheckboxLabel>
        <input
          type="checkbox"
          checked={moonInfo}
          onChange={(e) => setMoonInfo(e.currentTarget.checked)}
        />
        Moon
      </CheckboxLabel>
      <CheckboxLabel>
        <input
          type="checkbox"
          checked={showRecordingGaps}
          onChange={(e) => setShowRecordingGaps(e.currentTarget.checked)}
        />
        Recording gaps
      </CheckboxLabel>
    </SettingsGroup>
  );

  const layout = new PlotlyLayout();

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
            data={callEventData}
            onChangeSelectedCallTypes={setSelectedCallTypes}
          />
          {overlayControls}
        </>
      }
      layout={{
        ...layout,
        yaxis: {
          automargin: true,
          range: [moonInfo ? -2 : 0, 24],
          tickmode: "array",
          tickvals: [
            ...(moonInfo ? [-2] : []),
            ...[...new Array(7)].map((value, index) => index * 4),
          ],
          ticktext: [
            ...(moonInfo ? ["Moon"] : []),
            "Midn.",
            "4 AM",
            "8 AM",
            "Noon",
            "4 PM",
            "8 PM",
            "Midn.",
          ],
          tick0: 0,
          dtick: 4,
          showgrid: false,
        },
        xaxis: {
          ...layout.xaxis,
          range: [fromDate, toDate],
        },
      }}
      onClick={(event) => {
        if (!event.points[0]?.customdata) return;
        setSelectedCallEvent({
          ...event.points[0]?.customdata,
          markerColor: event.points[0]?.data?.marker?.color,
        });
      }}
      modalContent={renderModalContent()}
      closeModal={() => setSelectedCallEvent(null)}
      // dailySummary={{
      //   customdata: dailySummaryCustomData,
      //   hovertemplate: [
      //     `<b>${hoverTemplateStrings.date}</b>`,
      //     hoverTemplateStrings.detectionSummary,
      //     hoverTemplateStrings.recordingCoverage,
      //     hoverTemplateStrings.lunarAndSolar,
      //     `<extra></extra>`,
      //   ].join("<br>"),
      // }}
    />
  );
}

export default AcousticEventsChartLayout;
