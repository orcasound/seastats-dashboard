export class PlotlyLayout {
  // Retain zoom etc. when props change
  uirevision = "true";
  title = "";
  showlegend = false;
  font = {
    family: "Inter, Avenir, Helvetica, Arial, sans-serif",
    size: 14,
    color: "#666666",
  };
  hoverlabel = {
    bgcolor: "white",
    align: "left",
  };
  xaxis = {
    automargin: true,
    showgrid: false,
    rangeslider: {},
    // Prevents panning the x axes beyond the intended range at the cost of disabling drag to zoom or pan on chart. https://github.com/plotly/plotly.js/issues/887
    fixedrange: true,
  };
  margin = {
    l: 5,
    r: 5,
    b: 5,
    t: 15,
    pad: 4,
  };
}

export function binaryHeatmap(
  customdata,
  values,
  hovertemplate,
  colorOn = "rgba(0,0,0, 0.5)",
  colorOff = "rgba(0,0,0, 0)"
) {
  // A chart that covers the whole chart area, useful for e.g. daily summary hover info
  return {
    // Anchor to same x axis as other data
    x: customdata.map((row) => row.date),
    // Limit y axis range to a single step
    y: [1],
    // For each point on the y axis (there is only one), add an array of values for each point on the x axis (1 or 0)
    z: [values],
    customdata: [customdata],
    type: "heatmap",
    colorscale: [
      [0, colorOff],
      [1, colorOn],
    ],
    showscale: false,
    hovertemplate,
    yaxis: "y9",
  };
}

export function axisTitle(title) {
  return {
    text: title,
    font: {
      size: 14,
    },
  };
}
