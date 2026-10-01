function Pagination({ page, pages, onPageChange }) {
  if (!pages || pages <= 1) {
    return null;
  }

  return (
    <div className="card-surface flex flex-col items-center justify-between gap-3 p-4 sm:flex-row">
      <button
        type="button"
        className="btn-secondary"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <span className="mr-2" aria-hidden="true">←</span>Previous
      </button>
      <span className="text-sm font-medium text-app-copy">
        <span className="mr-1" aria-hidden="true">▦</span>Page {page} of {pages}
      </span>
      <button
        type="button"
        className="btn-secondary"
        disabled={page >= pages}
        onClick={() => onPageChange(page + 1)}
      >
        Next<span className="ml-2" aria-hidden="true">→</span>
      </button>
    </div>
  );
}

export default Pagination;
