import Color from "color";
import FieldTitle from "./basic/FieldTitle";
import CheckboxLabel from "./basic/CheckboxLabel";

function CheckboxOptions({ name, options, currValues, setCurrValues }) {
  function renderOption({ title, value, color }) {
    const checked = currValues.includes(value);
    const backgroundColor = Color(color).fade(0.9);
    const textColor = Color(color).darken(0.2);
    return (
      <CheckboxLabel key={value} style={{ backgroundColor, color: textColor }}>
        <input
          type="checkbox"
          name={name}
          value={value}
          checked={checked}
          onChange={() =>
            checked
              ? setCurrValues(currValues.filter((val) => val !== value))
              : setCurrValues([...currValues, value])
          }
        />
        {title}
      </CheckboxLabel>
    );
  }

  return (
    <span className="ss_CheckboxOptions">
      <FieldTitle>{name}</FieldTitle> {options.map(renderOption)}
    </span>
  );
}

export default CheckboxOptions;
