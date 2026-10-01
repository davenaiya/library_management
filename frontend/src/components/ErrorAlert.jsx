function ErrorAlert({ message }) {
  if (!message) {
    return null;
  }

  return (
    <div className="mb-4 rounded-2xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-800">
      {message}
    </div>
  );
}

export default ErrorAlert;
