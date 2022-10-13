import { useState } from "react";
import { callKey } from "../utils/helpers";

function useSelectedCallTypes(data = []) {
  const callKeys = data.map(({ species, callType }) =>
    callKey(species, callType)
  );
  const [selectedCallTypes, setSelectedCallTypes] = useState(callKeys);
  const filteredData = data.filter(({ species, callType }) =>
    selectedCallTypes.length
      ? selectedCallTypes.includes(callKey(species, callType))
      : true
  );

  return {
    filteredData,
    selectedCallTypes,
    setSelectedCallTypes,
  };
}

export default useSelectedCallTypes;
