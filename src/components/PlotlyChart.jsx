import PropTypes from "prop-types";
import Plotly from "plotly.js-cartesian-dist/plotly-cartesian";
import { binaryHeatmap } from "../utils/plotly";
import ChartWrapper from "./ChartWrapper";
import { faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import createPlotlyComponent from "react-plotly.js/factory";
const Plot = createPlotlyComponent(Plotly);

function PlotlyChart({
  data = [],
  layout = {},
  config,
  dailySummary,
  settingsControls,
  title = "",
  onClick,
  modalContent,
  closeModal,
}) {
  const withDailySummary = Array.isArray(dailySummary?.customdata);

  if (withDailySummary && !dailySummary?.hovertemplate) {
    throw new Error("Hovertemplate required for daily summary");
  }

  function getData() {
    const foregroundCharts = data.filter((chart) => !chart?.background);
    const backgroundCharts = data.filter((chart) => chart?.background);
    if (!withDailySummary) return [...backgroundCharts, ...foregroundCharts];

    // Add an invisible chart that covers the whole chart area, with a visible 'daily summary' hover tooltip
    return [
      ...backgroundCharts,
      binaryHeatmap(
        dailySummary.customdata,
        dailySummary.customdata.map(() => 1),
        dailySummary.hovertemplate,
        "rgba(0,0,0, 0)"
      ),
      ...foregroundCharts,
    ];
  }

  function getLayout() {
    // Add a y axis for our daily summary that will pin the chart
    return {
      ...layout,
      yaxis9: {
        automargin: true,
        title: "Daily information overlay",
        overlaying: "y",
        visible: false,
        range: [1],
        showgrid: false,
      },
    };
  }

  const plotlyProps = {
    data: getData(),
    config: {
      responsive: true,
      displayModeBar: false,
      displaylogo: false,
      ...config,
    },
    layout: getLayout(),
    onClick,
  };

  return (
    <ChartWrapper
      title={title}
      settingsControls={settingsControls}
      modalContent={modalContent}
      closeModal={closeModal}
      buttons={
        <button
          className="ss_download"
          onClick={() => {
            const tempDiv = document.createElement("div");
            Plotly.newPlot(
              tempDiv,
              plotlyProps.data,
              {
                ...plotlyProps.layout,
                xaxis: { ...plotlyProps.layout.xaxis, rangeslider: false },
                title,
                margin: { ...plotlyProps.layout.margin, t: 45 },
                showlegend: true,
              },
              plotlyProps.config
            ).then((graphDiv) => {
              Plotly.downloadImage(graphDiv, {
                format: "png",
                height: 500,
                width: 1000,
                filename: `chart-${title
                  .toLowerCase()
                  .replace(/\W/g, "-")}-${Date.now()}`,
                scale: 1.5,
              });
              Plotly.purge(graphDiv);
              tempDiv.remove();
            });
          }}
        >
          <span className="ss_iconLeft">
            <FontAwesomeIcon icon={faArrowDown} />
          </span>
          Download
        </button>
      }
    >
      <div className="ss_PlotlyChart">
        <Plot
          {...plotlyProps}
          useResizeHandler={true}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </ChartWrapper>
  );
}

PlotlyChart.propTypes = {
  data: PropTypes.array,
  layout: PropTypes.object,
  config: PropTypes.object,
  dailySummary: PropTypes.shape({
    customdata: PropTypes.array,
    hovertemplate: PropTypes.string,
  }),
  settingsControls: PropTypes.node,
  title: PropTypes.string,
  onClick: PropTypes.func,
  modalContent: PropTypes.node,
  closeModal: PropTypes.func,
};

export default PlotlyChart;
