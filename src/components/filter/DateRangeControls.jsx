import { isValid } from "date-fns";
import { useEffect, useState } from "react";
import ErrorMessage from "../basic/ErrorMessage";
import SettingsGroup from "../basic/SettingsGroup";
import FieldTitle from "../basic/FieldTitle";

function DateRangeControls({
  fromDate = "",
  toDate = "",
  minDate = "",
  maxDate = "",
  onChangeDateRange = () => {},
}) {
  const [startDate, setStartDate] = useState(fromDate);
  const [endDate, setEndDate] = useState(toDate);
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Send the date range to the parent component post-render to avoid a slow UI
  useEffect(() => {
    if (!mounted) return;
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const minDateObj = new Date(minDate);
    const maxDateObj = new Date(maxDate);
    if (
      isValid(startDateObj) &&
      isValid(endDateObj) &&
      startDateObj <= endDateObj &&
      minDateObj <= startDateObj &&
      endDateObj <= maxDateObj
    ) {
      onChangeDateRange(startDate, endDate);
      setError(false);
    } else {
      setError(true);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    // This is a half-way fix for a bug caused by having to put a key on our PlotlyChart component.
    // That causes this component to be destroyed and a new one created, and they end up competing with each other.
    // We still have the issue that the date input collapses after each click, even if you're not finished with it, because it doesn't exist anymore.
    setMounted(true);
  }, []);

  return (
    <SettingsGroup title="Date range">
      <label>
        <FieldTitle>From </FieldTitle>
        <input
          type="date"
          value={startDate}
          min={minDate}
          max={maxDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </label>
      <label>
        <FieldTitle>To </FieldTitle>
        <input
          type="date"
          value={endDate}
          min={startDate > minDate ? startDate : minDate}
          max={maxDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </label>
      {error && (
        <ErrorMessage
          message={`Please choose a date range between ${minDate} & ${maxDate}`}
        />
      )}
    </SettingsGroup>
  );
}

export default DateRangeControls;
