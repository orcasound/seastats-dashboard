function CheckboxLabel({ children, ...props }) {
  return (
    <label className="ss_CheckboxLabel" {...props}>
      {children}
    </label>
  );
}

export default CheckboxLabel;
