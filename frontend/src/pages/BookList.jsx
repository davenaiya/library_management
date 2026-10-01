import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BookCard from "../components/BookCard";
import EmptyState from "../components/EmptyState";
import ErrorAlert from "../components/ErrorAlert";
import LoadingSpinner from "../components/LoadingSpinner";
import Pagination from "../components/Pagination";
import { useAuth } from "../hooks/useAuth";
import AppShell from "../layouts/AppShell";
import { getErrorMessage } from "../services/api";
import { deleteBook, getBooks } from "../services/bookService";
import { requestIssue } from "../services/issueService";

function BookList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const canManage = ["admin", "librarian"].includes(user?.role);
  const canRequest = user?.role === "member" || !isAuthenticated;
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [requestingId, setRequestingId] = useState("");

  const fetchBooks = async (pageNumber = page, searchValue = search) => {
    setLoading(true);
    setError("");
    try {
      const response = await getBooks({
        page: pageNumber,
        limit: 8,
        search: searchValue || undefined
      });
      setBooks(response.data || []);
      setPage(response.page || 1);
      setPages(response.pages || 1);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to fetch books"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks(1, "");
  }, []);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    fetchBooks(1, search);
  };

  const handleResetSearch = () => {
    setSearch("");
    fetchBooks(1, "");
  };

  const handleRequest = async (book) => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: { pathname: "/books" },
          authPrompt: `Login to request "${book.title}".`
        }
      });
      return;
    }

    setRequestingId(book._id);
    setError("");
    try {
      await requestIssue(book._id);
      await fetchBooks(page, search);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to request book"));
    } finally {
      setRequestingId("");
    }
  };

  const handleDelete = async (book) => {
    const confirmed = window.confirm(`Delete "${book.title}" from inventory?`);
    if (!confirmed) {
      return;
    }

    try {
      await deleteBook(book._id);
      await fetchBooks(page, search);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to delete book"));
    }
  };

  return (
    <AppShell
      title="Library Management System"
      eyebrow="Digital Catalog"
      centerTitle
      subtitle={
        canManage
          ? "Manage library inventory, update records, and keep book availability accurate from one place."
          : "Browse the collection with a clean responsive catalog that highlights every book cover, title, and live copy availability."
      }
      actions={
        canManage ? (
          <button type="button" className="btn-primary min-w-[140px]" onClick={() => navigate("/add-book")}>
            <span className="mr-2" aria-hidden="true">+</span>Add Book
          </button>
        ) : !isAuthenticated ? (
          <>
            <button
              type="button"
              className="btn-secondary min-w-[110px]"
              onClick={() => navigate("/login", { state: { from: location } })}
            >
              Login
            </button>
            <button type="button" className="btn-primary min-w-[110px]" onClick={() => navigate("/register", { state: { from: location } })}>
              Register
            </button>
          </>
        ) : null
      }
    >
      <section className="catalog-hero mb-6 overflow-hidden rounded-[2rem] p-5 sm:p-7">
        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl text-left">
              <span className="inline-flex rounded-full border border-white/60 bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#7A5031] shadow-sm">
                {canManage ? "Library Inventory Dashboard" : "Public Library Dashboard"}
              </span>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#4E311B] sm:text-3xl">
                {canManage ? "Manage books at a glance" : "Discover books at a glance"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#6C4830]/85 sm:text-base">
                {canManage
                  ? "Search the catalog, update existing records, and keep stock levels aligned for members and staff."
                  : "Search the collection, review available copies, and move into login or registration only when needed."}
              </p>
            </div>
            <div className="catalog-summary-grid">
              <div className="catalog-summary-tile">
                <p className="catalog-summary-label">Showing</p>
                <p className="catalog-summary-value">{books.length}</p>
              </div>
              <div className="catalog-summary-tile">
                <p className="catalog-summary-label">Page</p>
                <p className="catalog-summary-value">{page}</p>
              </div>
              <div className="catalog-summary-tile">
                <p className="catalog-summary-label">Total Pages</p>
                <p className="catalog-summary-value">{pages}</p>
              </div>
            </div>
          </div>

          <div className="catalog-search-shell">
            <div className="mb-4 flex flex-col gap-1 text-left">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8B5E3C]">Search Catalog</p>
              <p className="text-sm text-[#6C4830]/80">
                {canManage
                  ? "Find books quickly before editing, deleting, or adding new inventory."
                  : "Find books by title or author with a cleaner browse experience."}
              </p>
            </div>
            <form className="flex flex-col gap-3 md:flex-row" onSubmit={handleSearchSubmit}>
              <input
                type="text"
                className="input-field flex-1"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by title or author"
              />
              <button type="submit" className="btn-primary md:w-40">
              <span className="mr-2" aria-hidden="true">⌕</span>Search
              </button>
              <button type="button" className="btn-secondary md:w-32" onClick={handleResetSearch}>
                <span className="mr-2" aria-hidden="true">↺</span>Reset
              </button>
            </form>
          </div>
        </div>
      </section>

      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8B5E3C]"><span aria-hidden="true">▤ </span>Book Collection</p>
          <h3 className="mt-2 text-2xl font-bold text-[#5C3A21]">Available Library Titles</h3>
        </div>
      </div>

      <ErrorAlert message={error} />

      {loading ? (
        <LoadingSpinner label="Loading books..." />
      ) : books.length === 0 ? (
        <EmptyState title="No books found" description="Try another search or add new inventory." />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {books.map((book) => (
              <BookCard
                key={book._id}
                book={book}
                canManage={canManage}
                canRequest={canRequest}
                requesting={requestingId === book._id}
                requestLabel="Request Book"
                onRequest={handleRequest}
                onEdit={(selectedBook) => navigate("/add-book", { state: { book: selectedBook } })}
                onDelete={handleDelete}
              />
            ))}
          </div>
          <Pagination page={page} pages={pages} onPageChange={(nextPage) => fetchBooks(nextPage, search)} />
        </div>
      )}
    </AppShell>
  );
}

export default BookList;
