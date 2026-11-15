import "./Input.css";

export default function Input({
  label,
  error,
  id,
  className = "",
  ...p
}) {
  const i = id || label?.replace(/\W/g, "");

  return (
    <div className="input-group">
      {label && (
        <label htmlFor={i} className="input-label">
          {label}
        </label>
      )}

      <input
        id={i}
        aria-invalid={!!error}
        className={`input-field ${error ? "input-error" : ""} ${className}`}
        {...p}
      />

      {error && (
        <span className="input-error-message" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}