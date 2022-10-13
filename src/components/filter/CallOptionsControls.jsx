import { useEffect, useState } from "react";
import { callKey } from "../../utils/helpers";
import CheckboxOptions from "../CheckboxOptions";
import SettingsGroup from "../basic/SettingsGroup";

function CallOptionsControls({
  data = [],
  onChangeSelectedCallTypes = () => {},
}) {
  const callKeys = data.map(({ species, callType }) =>
    callKey(species, callType)
  );
  const [selectedCallTypes, setSelectedCallTypes] = useState(callKeys);

  // Send the selections to the parent component post-render to avoid a slow UI
  useEffect(() => {
    onChangeSelectedCallTypes(selectedCallTypes);
  }, [selectedCallTypes.join()]);

  const species = [...new Set(data.map((row) => row.species))];

  return (
    <SettingsGroup title="Call types">
      {species.map((species) => (
        <CheckboxOptions
          key={species}
          name={species}
          options={data
            .filter((row) => row.species === species)
            .map(({ species, callType, markerColor }) => ({
              value: callKey(species, callType),
              title: callType,
              color: markerColor,
            }))}
          currValues={selectedCallTypes}
          setCurrValues={setSelectedCallTypes}
        />
      ))}
    </SettingsGroup>
  );
}

export default CallOptionsControls;
