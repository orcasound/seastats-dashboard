import Color from "color";

export function getChartColorFunc(chartColors) {
  return function (index, subIndex = 0) {
    const cycledIndex = index % chartColors.length;
    const color = Color(chartColors[cycledIndex]);
    const modified = subIndex ? color.darken(0.2 * subIndex) : color;
    return modified.hex();
  };
}
