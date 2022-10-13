import SunCalc from "suncalc";
import { add, eachDayOfInterval, format, parseISO } from "date-fns";
import { Moon } from "lunarphase-js";
import { binaryHeatmap } from "./plotly";
import { backfillData } from "./data";

// Convert to local date time compatible with input
// Get the greater of daylight illumination and moonlight illumination

export function formatHourOfDayForChart(dateOb, timeZone) {
  if (!dateOb || isNaN(dateOb)) return null;
  const hour = parseFloat(
    dateOb.toLocaleString("en-US", {
      timeZone,
      hour: "numeric",
      hourCycle: "h24",
    })
  );
  const minute = parseFloat(
    dateOb.toLocaleString("en-US", {
      timeZone,
      minute: "numeric",
    })
  );
  const minuteAsHourPortion = minute / 60;
  return (hour % 24) + minuteAsHourPortion;
}

export function sunAndMoonData(
  fromDate,
  toDate,
  {
    timeZone = "America/Vancouver",
    lat = 53.69919824095036,
    lon = -130.4692817438937,
  } = {}
) {
  // Dates will be at midnight in user's local timezone
  return eachDayOfInterval({
    start: parseISO(fromDate),
    end: parseISO(toDate),
  }).map((midnightDate) => {
    // Try to correct for moon data given for wrong date
    const date = add(midnightDate, { hours: 12 });
    const sun = SunCalc.getTimes(date, lat, lon);
    const moon = {
      ...SunCalc.getMoonIllumination(date),
      ...SunCalc.getMoonTimes(date, lat, lon),
    };

    return {
      date: format(date, "yyyy-MM-dd"),
      sunrise: formatHourOfDayForChart(sun.sunrise, timeZone),
      sunset: formatHourOfDayForChart(sun.sunset, timeZone),
      moonFraction: moon.fraction,
      moonEmoji: Moon.lunarPhaseEmoji(date),
    };
  });
}

export const hoverTemplateStrings = {
  lunarAndSolar:
    "%{customdata.moonEmoji} ☀️⬆ %{customdata.sunrise} ☀️⬇ %{customdata.sunset}",
  date: "%{x|%a %b %-d, %Y}",
  recordingCoverage:
    'Recording coverage: <b style="color: %{customdata.recordingCoverageTextColor}">%{customdata.recordingCoveragePercent:.0f}%</b>',
  detectionSummary:
    "Detections: <b>%{customdata.detections.numEvents}</b>  Calls: <b>%{customdata.detections.numCalls}</b>",
};

export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function colorForValue(value) {
  // Green for good, red for bad
  const good = value >= 0.5;
  const baseColor = good
    ? {
        h: 140,
        s: 75,
        l: 28 * (value * 2 - 1),
      }
    : {
        h: 0,
        s: 100,
        l: 44 * (1 - value * 2),
      };
  return `hsl(${baseColor.h} ${baseColor.s}% ${baseColor.l}%)`;
}

export function recordingCoverageWithMeta(data, fromDate, toDate) {
  const backFilled =
    fromDate && toDate ? backfillData(data, fromDate, toDate) : data;
  return backFilled.map((row) => {
    const value = row.recordingCoverage
      ? row.recordingCoverage
      : row.value || 0;
    return {
      ...row,
      recordingCoverage: value,
      recordingCoverageTextColor: colorForValue(value),
      recordingCoveragePercent: value * 100,
    };
  });
}

export function recordingCoverageBinaryChartConfig(data, visible = true) {
  const recordingEffortGaps = data.map((row) =>
    row.recordingCoverage < 0.5 ? 1 : 0
  );
  return {
    ...binaryHeatmap(data, recordingEffortGaps, "", "rgba(0,0,0, 0.1)"),
    hoverinfo: "skip",
    visible,
    background: true,
  };
}

export function matchDateRangeFilter(dataToMatch) {
  return ({ date }) =>
    date >= dataToMatch.at(0).date && date <= dataToMatch.at(-1).date;
}

export function callKey(species, callType) {
  return `${species}_${callType}`.replace(/\W/g, "");
}

export function getMinMaxRange(array, property) {
  return array.reduce(
    (result, curr) => {
      if (result.max === null || curr[property] > result.max) {
        result.max = curr[property];
      }
      if (result.min === null || curr[property] < result.min) {
        result.min = curr[property];
      }
      return result;
    },
    { min: null, max: null }
  );
}

export function getUrlParams() {
  const urlParts = window.location.pathname
    .split("/")
    .filter((p) => p)
    .slice(-2);
  return {
    organizationKey: urlParts?.[0] || "",
    stationKey: urlParts?.[1] || "",
  };
}

export const apiUrl = (() => {
  const url = import.meta.env.VITE_API_URL;
  if (!url) {
    throw new Error("API URL not set");
  }
  return url.at(-1) === "/" ? url : `${url}/`;
})();

// This is the default logo for the app, encoded so it can be used without knowing an absolute url for the source image
export const defaultLogoSrc =
  "data:image/png;base64,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";

export function ordinal(n) {
  var s = ["th", "st", "nd", "rd"];
  var v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function formatDateLong(dateString) {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return parseISO(dateString).toLocaleDateString(undefined, options);
}

export function formatDateShort(dateString) {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return parseISO(dateString).toLocaleDateString(undefined, options);
}