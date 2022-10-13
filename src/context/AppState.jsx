import { createContext } from "react";

export const AppState = createContext({
  selectedChart: null,
  navOpen: true,
  setNavOpen: () => {},
});
