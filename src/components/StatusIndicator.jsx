function StatusIndicator({ status }) {
  return (
    <span className={["ss_StatusIndicator", `ss_${status}`].join(" ")}></span>
  );
}

export default StatusIndicator;
