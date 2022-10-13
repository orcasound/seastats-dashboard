import { ordinal } from "../utils/helpers";

function Gauge({ percentile = 0, value = 0, unit = "" }) {
  const fill = Math.min(Math.max(percentile / 100, 0), 1);
  // const fill = 1;

  const status = (() => {
    if (fill < 1 / 3) return "good";
    if (fill < 2 / 3) return "warn";
    return "bad";
  })();

  const color = `var(--ssColor${status[0].toUpperCase() + status.slice(1)})`;
  const turn = `${fill * 0.75}turn`;

  const gaugeStyle = {
    background: `conic-gradient(${color} ${turn}, var(--ssGaugeUnfilled) ${turn} .75turn, var(--ssGaugeBackground) .75turn)`,
  };

  return (
    <div className={`ss_Gauge ss_${status}`}>
      <div className="ss_gauge" style={gaugeStyle}></div>
      <div className="ss_content">
        <div className="ss_value">{value}</div>
        <div className="ss_unit">{unit}</div>
      </div>
      <div className="ss_percentile">
        <span className="ss_value">{ordinal(percentile.toFixed(0))}</span>{" "}
        percentile
      </div>
    </div>
  );
}

export default Gauge;
