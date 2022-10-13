import { useContext, useState } from "react";
import { groupedAverage, rollingAverage } from "../utils/math";
import SettingsGroup from "../components/basic/SettingsGroup";
import FieldTitle from "../components/basic/FieldTitle";
import { Settings } from "../context/Settings";

function useSmoothing() {
  const { chartColor } = useContext(Settings);
  const [smoothing, setSmoothing] = useState("");
  const [averageWeeks, setAverageWeeks] = useState(1);

  function smooth(data, xProp, yProp) {
    if (!smoothing) return data;
    if (smoothing == "rolling")
      return rollingAverage(data, xProp, yProp, averageWeeks * 7);
    if (smoothing == "interpolated")
      return groupedAverage(data, xProp, yProp, averageWeeks * 7);
  }

  function SmoothingControls() {
    const averageMinLimit = 1;
    const averageMaxLimit = 4;

    return (
      <SettingsGroup title="Smoothing">
        <label>
          <FieldTitle>Type </FieldTitle>
          <select
            value={smoothing}
            onChange={(e) => setSmoothing(e.target.value)}
          >
            <option value="">None</option>
            <option value="rolling">Rolling average</option>
            <option value="interpolated">Interpolated average</option>
          </select>
        </label>
        {smoothing && (
          <span className="ss_averageControls">
            <FieldTitle>Time span (weeks) </FieldTitle>
            <button
              className="ss_decrease"
              onClick={() => {
                setAverageWeeks(averageWeeks - 1);
              }}
              disabled={averageWeeks <= averageMinLimit}
            >
              -
            </button>
            <span className="ss_value"> {averageWeeks} </span>
            <button
              className="ss_increase"
              onClick={() => {
                setAverageWeeks(averageWeeks + 1);
              }}
              disabled={averageWeeks >= averageMaxLimit}
            >
              +
            </button>
          </span>
        )}
      </SettingsGroup>
    );
  }

  const plotlySmoothedLineConfig = () => {
    const config = {
      type: "scatter",
      mode: "lines",
      line: {
        color: chartColor(0),
      },
      hovertemplate: "",
      hoverinfo: "skip",
      fill: "tozeroy",
      connectgaps: false,
    };
    if (smoothing === "interpolated") {
      config.line = {
        ...config.line,
        shape: "spline",
        smoothing: 1.3,
      };
    }
    return config;
  };

  const averageWeeksNotation = smoothing ? ` (${averageWeeks}w average)` : "";

  return {
    smoothing,
    smoothingControls: <SmoothingControls />,
    smooth,
    plotlySmoothedLineConfig,
    averageWeeksNotation,
  };
}

export default useSmoothing;
