import Button from './Button.jsx';

export default function LoadError({ message, onRetry }) {
  return (
    <div className="load-error" role="alert">
      <strong>No se pudo cargar la información</strong>
      <p>{message}</p>
      {onRetry && <Button variant="ghost" onClick={onRetry}>Reintentar</Button>}
    </div>
  );
}
