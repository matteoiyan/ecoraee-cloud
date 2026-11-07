import { useEffect } from 'react';

export default function Toast({ message, onDismiss }) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 2800);
    return () => window.clearTimeout(timer);
  }, [onDismiss]);

  return <div className="toast" role="status">{message}</div>;
}
