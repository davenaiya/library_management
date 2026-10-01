function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="card-surface flex flex-col items-center justify-center gap-4 py-12 text-app-meta">
      <div className="h-11 w-11 animate-spin rounded-full border-4 border-primary-100 border-t-primary-500" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export default LoadingSpinner;
