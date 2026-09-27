import './Input.css';
// A labelled input (or textarea). The label is linked to the field for accessibility.
export default function Input({ label, id, error, hint, multiline = false, type, className = '', ...props }) {
  const Field = multiline ? 'textarea' : 'input';
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  // Text inputs need an explicit type="text" in the markup: our CSS styles
  // inputs with [type='text'|'email'|'password'|...], and a <input> with no
  // type attribute at all won't match any of those selectors.
  const resolvedType = multiline ? undefined : type || 'text';

  return (
    <div className={`field ${className}`}>
      {label && <label htmlFor={id}>{label}</label>}
      <Field id={id} type={resolvedType} aria-invalid={Boolean(error)} aria-describedby={describedBy} {...props} />
      {hint && !error && <p className="field__hint" id={`${id}-hint`}>{hint}</p>}
      {error && <p className="field__error" id={`${id}-error`}>{error}</p>}
    </div>
  );
}