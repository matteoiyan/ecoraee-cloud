export default function Button({ variant = 'ghost', size, className = '', type = 'button', ...props }) {
  return <button type={type} className={`btn ${variant} ${size === 'small' ? 'sm' : ''} ${className}`.trim()} {...props} />;
}
