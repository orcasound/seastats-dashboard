import { parseISO, eachDayOfInterval, formatISO } from "date-fns";
import { formatHourOfDayForChart, getMinMaxRange } from "./helpers";

function toDate(dateTime, timeZone = "America/Vancouver") {
  // Swedish locale gives YYYY-MM-DD format
  return new Date(dateTime).toLocaleDateString("sv-SE", {
    timeZone,
  });
}

export function backfillData(data = [], fromDate, toDate) {
  if (!fromDate || !toDate) throw new Error("Missing date range");
  // Sort the data by the date property as a string, then add values for any missing dates with value set to null
  const sortedData = data.sort((a, b) => a.date.localeCompare(b.date));
  const firstAvailableDate = sortedData.at(0)?.date;
  const lastAvailableDate = sortedData.at(-1)?.date;
  const daysBetween = eachDayOfInterval({
    start: parseISO(fromDate),
    end: parseISO(toDate),
  }).length;
  // Backfill if necessary with empty values
  if (
    firstAvailableDate !== fromDate ||
    lastAvailableDate !== toDate ||
    sortedData.length !== daysBetween
  ) {
    // Copy the data structure of first item but with null values
    const template = {};
    if (sortedData.at(0)) {
      Object.keys(sortedData.at(0)).forEach((key) => {
        template[key] = null;
      });
    }
    // Create an entry for each date in the range
    const filled = eachDayOfInterval({
      start: parseISO(fromDate),
      end: parseISO(toDate),
    }).map((date, index) => ({
      ...template,
      date: formatISO(date, { representation: "date" }),
    }));
    // If we don't have any data return now
    if (sortedData.length === 0) return filled;
    // Create a map of the data keyed by date
    const keyedData = sortedData.reduce((result, curr) => {
      result[curr.date] = curr;
      return result;
    }, {});
    // Replace any blank entries with the data from the map
    filled.forEach((blank) => {
      if (keyedData[blank.date]) {
        Object.assign(blank, keyedData[blank.date]);
      }
    });
    return filled;
  }
  return sortedData;
}

export function getAdjustedDateRange(data, settings) {
  // Sort by startDateTime
  const sorted = [...data].sort((a, b) =>
    a.startDateTime.localeCompare(b.startDateTime)
  );
  const adjustedMinDate = toDate(
    sorted.at(0)?.startDateTime,
    settings?.stationData?.timeZone
  );
  const adjustedMaxDate = toDate(
    sorted.at(-1)?.startDateTime,
    settings?.stationData?.timeZone
  );
  return {
    adjustedMinDate,
    adjustedMaxDate,
  };
}

export function restructureCallEventData(data, settings) {
  // Group in to a nested structure
  const nested = [];
  data.map((item) => {
    const { species, callType } = item;
    const speciesIndex = nested.findIndex((row) => row.species === species);
    if (speciesIndex === -1) {
      nested.push({
        species,
        calls: [
          {
            callType,
            rows: [{ ...item }],
          },
        ],
      });
    } else {
      const callIndex = nested[speciesIndex].calls.findIndex(
        (row) => row.callType === callType
      );
      if (callIndex === -1) {
        nested[speciesIndex].calls.push({
          callType,
          rows: [{ ...item }],
        });
      } else {
        nested[speciesIndex].calls[callIndex].rows.push({
          ...item,
        });
      }
    }
  });

  // Sort to ensure colours are consistent
  nested.sort((a, b) => a.species.localeCompare(b.species));
  nested.forEach((speciesRow) => {
    speciesRow.calls.sort((a, b) => a.callType.localeCompare(b.callType));
  });

  // Flatten one level and add a colour for each call type
  const flattened = [];
  nested.forEach((speciesRow, speciesIndex) => {
    speciesRow.calls.forEach((callsRow, callsIndex) => {
      flattened.push({
        ...callsRow,
        species: speciesRow.species,
        markerColor: settings.chartColor(speciesIndex, callsIndex),
        callCountRange: getMinMaxRange(callsRow.rows, "callCount"),
      });
    });
  });

  // Convert to local time and add metadata
  flattened.forEach((row) => {
    row.rows = row.rows.map((callEvent) =>
      decorateCallEvent(callEvent, settings?.stationData?.timeZone || undefined)
    );
  });

  return flattened;
}

export function decorateCallEvent(callEvent, timeZone = "America/Vancouver") {
  // Correct the date format to UTC if necessary
  const startDateTime = `${callEvent.startDateTime}`.replace(
    /^(\d{4}-\d{2}-\d{2}) ([\d:.]*)$/,
    (match, date, time) => `${date}T${time}Z`
  );
  const endDateTime = `${callEvent.endDateTime}`.replace(
    /^(\d{4}-\d{2}-\d{2}) ([\d:.]*)$/,
    (match, date, time) => `${date}T${time}Z`
  );

  const duration =
    (new Date(endDateTime).getTime() - new Date(startDateTime).getTime()) /
    1000;
  const minutes = Math.round(duration / 60) || 1;
  const remainderMinutes = minutes % 60;
  const hours = Math.floor(minutes / 60);
  return {
    ...callEvent,
    // Swedish locale gives YYYY-MM-DD format
    date: toDate(startDateTime, timeZone),
    eventHour: formatHourOfDayForChart(new Date(startDateTime), timeZone),
    timeFrom: new Date(startDateTime).toLocaleTimeString("en-US", {
      timeZone,
      hour: "numeric",
      minute: "2-digit",
    }),
    timeTo: new Date(endDateTime).toLocaleTimeString("en-US", {
      timeZone,
      hour: "numeric",
      minute: "2-digit",
    }),
    duration: {
      hours,
      minutes: remainderMinutes,
    },
    durationText: `${hours ? `${hours}h ` : ""}${remainderMinutes}m`,
    callsPerMinute: callEvent.callCount / minutes,
  };
}
