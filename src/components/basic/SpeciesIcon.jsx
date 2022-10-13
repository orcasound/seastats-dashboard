import speciesIconSvgs from "./speciesIconSvgs";

function SpeciesIcon({ species }) {
  if (!speciesIconSvgs[species]) {
    return null;
  }
  return <div className="ss_SpeciesIcon">{speciesIconSvgs[species]}</div>;
}

export default SpeciesIcon;
