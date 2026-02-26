export default function Spinner({ size = 20, className = "" }) {
  const dimension = `${size}px`;
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-slate-600 border-t-sky-400 ${className}`}
      style={{ width: dimension, height: dimension }}
      aria-label="Loading"
      role="status"
    />
  );
}
