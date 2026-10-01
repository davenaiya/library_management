import { toImageUrl } from "../utils/formatters";

function BookCard({
  book,
  className = "",
  canManage = false,
  canRequest = false,
  requesting = false,
  requestLabel = "Request Book",
  onRequest,
  onEdit,
  onDelete
}) {
  return (
    <article className={`book-display-card group overflow-hidden ${className}`.trim()}>
      <div className="relative p-3 pb-0 sm:p-4 sm:pb-0">
        <div className="book-cover-frame">
          <img
            src={toImageUrl(book.image)}
            alt={book.title}
            className="h-full w-full rounded-[1.2rem] object-contain transition duration-300 group-hover:scale-[1.03]"
          />
        </div>
      </div>
      <div className="space-y-3 p-4 sm:p-5">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9A6A45]"><span aria-hidden="true">▤ </span>Library Book</p>
          <h3 className="min-h-[3rem] text-base font-semibold leading-6 text-app-text sm:text-lg">{book.title}</h3>
          <p className="text-sm text-app-copy">{book.author || "Unknown author"}</p>
        </div>
        <div className="grid grid-cols-2 rounded-[1.2rem] bg-[#F9F1E8]/95 p-1.5 text-sm ring-1 ring-[#8B5E3C]/8">
          <div className="rounded-[0.9rem] px-3 py-2.5">
            <p className="text-sm text-app-meta"><span aria-hidden="true">▦ </span>Total Copies</p>
            <p className="mt-1 text-xl font-semibold text-app-text">{book.quantity ?? 0}</p>
          </div>
          <div className="rounded-[0.9rem] border-l border-[#8B5E3C]/10 px-3 py-2.5">
            <p className="text-sm text-app-meta"><span aria-hidden="true">✓ </span>Available Copies</p>
            <p className="mt-1 text-xl font-semibold text-app-text">{book.available ?? 0}</p>
          </div>
        </div>

        {canManage ? (
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              className="inline-flex w-full items-center justify-center rounded-xl border border-[#8B5E3C]/20 bg-white px-4 py-2.5 text-sm font-semibold text-[#5C3A21] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#F5EDE6]"
              onClick={() => onEdit?.(book)}
            >
              <span className="mr-2" aria-hidden="true">✎</span>Edit
            </button>
            <button
              type="button"
              className="inline-flex w-full items-center justify-center rounded-xl bg-[#5C3A21] px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#8B5E3C]"
              onClick={() => onDelete?.(book)}
            >
              <span className="mr-2" aria-hidden="true">⌫</span>Delete
            </button>
          </div>
        ) : null}

        {!canManage && canRequest ? (
          <button
            type="button"
            className="btn-primary w-full"
            disabled={requesting || Number(book.available) <= 0}
            onClick={() => onRequest?.(book)}
          >
            <span className="mr-2" aria-hidden="true">{Number(book.available) <= 0 ? "×" : requesting ? "◌" : "+"}</span>
            {Number(book.available) <= 0 ? "Unavailable" : requesting ? "Requesting..." : requestLabel}
          </button>
        ) : null}
      </div>
    </article>
  );
}

export default BookCard;
