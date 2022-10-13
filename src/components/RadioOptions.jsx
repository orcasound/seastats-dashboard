function RadioOptions({ name, options, currValue, setCurrValue }) {
  function renderOption({ title, value }) {
    return (
      <label>
        <input
          type="radio"
          name={name}
          value={value}
          checked={currValue === value}
          onChange={() => setCurrValue(value)}
        />
        {title}
      </label>
    );
  }

  return (
    <form>
      {name}: {options.map(renderOption)}
    </form>
  );
}

export default RadioOptions;
