import { useState } from "react";
import ChartWrapper from "../components/ChartWrapper";
import {
  faAngleLeft,
  faAngleRight,
  faArrowDown,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ErrorMessage from "../components/basic/ErrorMessage";

function StaticGraphicChartLayout({
  title = "",
  uploadType = "",
  chartUploads = [],
}) {
  if (chartUploads.length === 0)
    return <ErrorMessage message="No charts found." />;

  const calendarData = chartUploads.reduce((result, { date, url }) => {
    const [year, month, day] = date.split("-");
    if (result[year] === undefined) result[year] = {};
    if (result[year][month] === undefined) result[year][month] = {};
    if (result[year][month][day] === undefined) result[year][month][day] = url;
    return result;
  }, {});
  const yearOptions = Object.keys(calendarData).sort();
  const [selectedYear, setSelectedYear] = useState(
    yearOptions[yearOptions.length - 1]
  );
  const monthOptions = Object.keys(calendarData[selectedYear]).sort();
  const defaultMonth = monthOptions[monthOptions.length - 1];
  const [unsafeSelectedMonth, setSelectedMonth] = useState(defaultMonth);
  const selectedMonth =
    calendarData[selectedYear][unsafeSelectedMonth] !== undefined
      ? unsafeSelectedMonth
      : defaultMonth;
  const dayOptions = Object.keys(
    calendarData[selectedYear][selectedMonth]
  ).sort();
  const defaultDay = dayOptions[dayOptions.length - 1];
  const [unsafeSelectedDay, setSelectedDay] = useState(defaultDay);
  const selectedDay =
    calendarData[selectedYear][selectedMonth][unsafeSelectedDay] !== undefined
      ? unsafeSelectedDay
      : defaultDay;

  const imageUrl = calendarData[selectedYear][selectedMonth][selectedDay];

  function currIndex() {
    return chartUploads.findIndex(
      ({ date }) => date === `${selectedYear}-${selectedMonth}-${selectedDay}`
    );
  }

  function nextIndex() {
    const currI = currIndex();
    return chartUploads[currI + 1] !== undefined ? currI + 1 : -1;
  }

  function prevIndex() {
    const currI = currIndex();
    return chartUploads[currI - 1] !== undefined ? currI - 1 : -1;
  }

  function go(date) {
    const [year, month, day] = date.split("-");
    setSelectedYear(year);
    setSelectedMonth(month);
    setSelectedDay(day);
  }

  function goNext() {
    go(chartUploads[nextIndex()].date);
  }

  function goPrev() {
    go(chartUploads[prevIndex()].date);
  }

  return (
    <ChartWrapper
      title={title}
      buttons={
        <a href={`${imageUrl}?download=1`}>
          <span className="ss_iconLeft">
            <FontAwesomeIcon icon={faArrowDown} />
          </span>
          Download
        </a>
      }
    >
      <div className="ss_StaticGraphicChart">
        <div className="ss_settingsControls">
          <button
            className="ss_prev"
            onClick={goPrev}
            disabled={prevIndex() < 0}
          >
            <span className="ss_iconLeft">
              <FontAwesomeIcon icon={faAngleLeft} />
            </span>
            Prev
          </button>
          <label className="ss_year">
            Year:
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              disabled={yearOptions.length === 1}
            >
              {yearOptions.map((title) => (
                <option value={title} key={title}>
                  {title}
                </option>
              ))}
            </select>
          </label>
          <label className="ss_month">
            Month:
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              disabled={monthOptions.length === 1}
            >
              {monthOptions.map((title) => (
                <option value={title} key={title}>
                  {title}
                </option>
              ))}
            </select>
          </label>
          <label className="ss_day">
            Day:
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              disabled={dayOptions.length === 1}
            >
              {dayOptions.map((title) => (
                <option value={title} key={title}>
                  {title}
                </option>
              ))}
            </select>
          </label>
          <button
            className="ss_next"
            onClick={goNext}
            disabled={nextIndex() < 0}
          >
            Next
            <span className="ss_iconRight">
              <FontAwesomeIcon icon={faAngleRight} />
            </span>
          </button>
        </div>
        <div className="ss_image">
          <img
            src={imageUrl}
            alt={`Chart graphic for ${selectedYear}-${selectedMonth}-${selectedDay}`}
          />
        </div>
      </div>
    </ChartWrapper>
  );
}

export default StaticGraphicChartLayout;
