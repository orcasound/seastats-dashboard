function averageValue(values) {
  // Given an array of values, return an average that disregards non-numeric values.
  // If less than half of the values are numeric, return null, to signal a gap in the data.
  const numericValues = values.filter((value) => typeof value === "number");
  return numericValues.length >= values.length / 2
    ? numericValues.reduce((result, curr) => result + curr, 0) /
        numericValues.length
    : "";
}

export function groupedAverage(data = [], xProp = "", yProp = "", numDays = 0) {
  return rollingAverage(data, xProp, yProp, numDays, false);
}

export function rollingAverage(
  data = [],
  xProp = "",
  yProp = "",
  numDays = 0,
  rolling = true
) {
  return data.reduce((result, curr, index) => {
    const half = Math.floor(numDays / 2);
    const remainder = numDays % 2;
    const prevDays = half;
    const afterDays = remainder === 0 ? half - 1 : half;
    if (
      index >= prevDays && rolling
        ? true
        : (index + afterDays + 1) % numDays === 0
    ) {
      const points = data.slice(index - prevDays, index + afterDays + 1);
      if (points.length === numDays) {
        result.push({
          [xProp]: curr[xProp],
          [yProp]: averageValue(points.map((point) => point[yProp])),
        });
      }
    }
    return result;
  }, []);
}

export function round(value = 0, precision = 0, asString = true) {
  var multiplier = Math.pow(10, precision || 0);
  const result = Math.round(value * multiplier) / multiplier;
  return asString ? result.toFixed(precision) : result;
}
