function SettingsGroup({ title = "", children }) {
  return (
    <div className="ss_SettingsGroup">
      <h4>{title}</h4>
      <div className="ss_fields">{children}</div>
    </div>
  );
}

export default SettingsGroup;
