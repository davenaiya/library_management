import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BookForm from "../components/BookForm";
import AppShell from "../layouts/AppShell";
import { getErrorMessage } from "../services/api";
import { createBook, updateBook } from "../services/bookService";

function AddBook() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingBook = location.state?.book || null;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError("");

    try {
      if (editingBook) {
        await updateBook(editingBook._id, formData);
      } else {
        await createBook(formData);
      }
      navigate("/books");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to save book"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell
      title={editingBook ? "Update Book" : "Add Book"}
      subtitle="Use multipart form submission so cover images upload cleanly with the rest of the book data."
    >
      <BookForm
        initialValues={editingBook}
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        submitLabel={editingBook ? "Update Book" : "Add Book"}
      />
    </AppShell>
  );
}

export default AddBook;
