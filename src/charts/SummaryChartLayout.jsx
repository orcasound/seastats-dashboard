import { useContext } from "react";
import ChartWrapper from "../components/ChartWrapper";
import Gauge from "../components/Gauge";
import { decorateCallEvent } from "../utils/data";
import { Settings } from "../context/Settings";
import { formatDateShort, formatDateLong } from "../utils/helpers";

function SummaryChartLayout({
  title = "",
  minDate = "",
  maxDate = "",
  chartData = {},
}) {
  const { creditsHtml, stationData } = useContext(Settings);
  const { noiseData, callEventData } = chartData;
  const latestEvent = callEventData
    .map((callEvent) =>
      decorateCallEvent(callEvent, stationData?.timeZone || undefined)
    )
    .sort((a, b) => {
      if (a.date < b.date) return 1;
      if (a.date > b.date) return -1;
      return 0;
    })?.[0];

  return (
    <ChartWrapper
      title={title}
      footer={
        creditsHtml ? (
          <div dangerouslySetInnerHTML={{ __html: creditsHtml }} />
        ) : null
      }
    >
      <div className="ss_SummaryChart">
        {latestEvent && (
          <div className="ss_latestCallEvent">
            <h2>Latest acoustic event</h2>
            <p className="ss_date ss_subTitle">
              {formatDateLong(latestEvent.date)}
            </p>
            <p className="ss_time ss_subTitle">
              {latestEvent.timeFrom} – {latestEvent.timeTo} (
              {latestEvent.durationText})
            </p>
            <dl>
              <dt className="ss_species">Species</dt>
              <dd className="ss_species">{latestEvent.species}</dd>
              <dt className="ss_calls">Calls</dt>
              <dd className="ss_calls">{latestEvent.callCount}</dd>
              <dt className="ss_callsPerMinute">Calls/m</dt>
              <dd className="ss_callsPerMinute">
                {latestEvent.callsPerMinute.toFixed(2)}
              </dd>
            </dl>
          </div>
        )}
        {noiseData && (
          <div className="ss_latestNoiseLevels">
            <h2>Latest noise level</h2>
            <p className="ss_date ss_subTitle">
              {formatDateLong(noiseData.latest.date)}
            </p>
            <div className="ss_percentile">
              <Gauge
                percentile={noiseData.percentile}
                value={noiseData.latest.value.toFixed(0)}
                unit="dB re 1μPa"
              />
              <p className="ss_summary">
                Latest daily average was{" "}
                <b>{noiseData.percentile > 50 ? "louder" : "quieter"}</b> than{" "}
                <b>
                  {noiseData.percentile > 50
                    ? noiseData.percentile.toFixed(0)
                    : 100 - noiseData.percentile.toFixed(0)}
                  %
                </b>{" "}
                of historical readings since{" "}
                <span className="ss_oldestDate">
                  {formatDateShort(noiseData.oldest.date)}.
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </ChartWrapper>
  );
}

export default SummaryChartLayout;
