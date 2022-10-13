import { createContext } from "react";

export const Settings = createContext({
  stationData: null,
  layoutMode: null,
  charts: [],
  chartColor: () => {},
  styles: "all",
});
