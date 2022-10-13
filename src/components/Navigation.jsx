import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartColumn,
  faChartLine,
  faGauge,
  faMicrophone,
  faWaveSquare,
} from "@fortawesome/free-solid-svg-icons";
import iconBubbleChart from "../icons/iconBubbleChart";

const chartIcons = {
  SummaryChart: faGauge,
  DailyDetectionsChart: faChartColumn,
  AcousticEventsChart: iconBubbleChart,
  StaticGraphicChart: faWaveSquare,
  SoundLevelChart: faMicrophone,
  RecordingConsistencyChart: faChartLine,
};

function Navigation({ charts, selectedIndex, setSelectedIndex }) {
  function renderNavItem({ title, componentName }, index) {
    const active = index === selectedIndex;
    return (
      <button
        key={index}
        className={`ss_nav${componentName}${active ? " active" : ""}`}
        disabled={active}
        onClick={() => setSelectedIndex(index)}
      >
        <span className="ss_iconLeft">
          <FontAwesomeIcon icon={chartIcons[componentName]} fixedWidth />
        </span>
        {title}
      </button>
    );
  }

  return <nav className="ss_Navigation">{charts.map(renderNavItem)}</nav>;
}

export default Navigation;
