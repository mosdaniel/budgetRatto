/**
 * Input — unified component for <input> and <select>.
 * Handles: label, required marker, error message, hint text, placeholder.
 * Use isSelect=true to render a styled <select> instead.
 */
export default function Input({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  error = '',
  hint = '',
  required = false,
  min,
  max,
  step,
  className = '',
  isSelect = false,
  children,         // only used when isSelect=true
  autoFocus = false,
}) {
  const fieldClasses = [
    isSelect ? 'input-field select-field' : 'input-field',
    error ? 'input-field--error' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="input-group">
      {label && (
        <label className="input-label" htmlFor={id}>
          {label}
          {required && <span className="required"> *</span>}
        </label>
      )}

      {isSelect ? (
        <select
          id={id}
          className={fieldClasses}
          value={value}
          onChange={onChange}
        >
          {children}
        </select>
      ) : (
        <input
          id={id}
          type={type}
          className={fieldClasses}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          autoFocus={autoFocus}
        />
      )}

      {error && <span className="input-error-msg" role="alert">{error}</span>}
      {hint && !error && <span className="input-hint">{hint}</span>}
    </div>
  )
}
