import "./Checkbox.css";

const Checkbox = ({className,checked,setChecked}) => {
  return (
    <>
      <label className={`checkbox-container ${className}`}>
        <input checked={checked} onChange={setChecked} class="custom-checkbox"  type="checkbox" />
        <span class="checkmark"></span>
      </label>
    </>
  );
};

export default Checkbox;
