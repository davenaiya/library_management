function EmptyState({ title, description }) {
  return (
    <div className="card-surface px-6 py-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary-50 text-lg font-semibold text-primary-700">
        0
      </div>
      <h3 className="mt-4 text-lg font-semibold text-app-text">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-app-copy">{description}</p>
    </div>
  );
}

export default EmptyState;
