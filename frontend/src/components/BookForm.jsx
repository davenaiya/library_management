import { useEffect, useState } from "react";
import ErrorAlert from "./ErrorAlert";

const initialState = {
  title: "",
  author: "",
  quantity: "",
  image: null
};

function BookForm({ initialValues, onSubmit, loading, error, submitLabel }) {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (initialValues) {
      setForm({
        title: initialValues.title || "",
        author: initialValues.author || "",
        quantity: initialValues.quantity ?? "",
        image: null
      });
    } else {
      setForm(initialState);
    }
  }, [initialValues]);

  const handleChange = (event) => {
    const { name, value, files } = event.target;
    setForm((current) => ({
      ...current,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = new FormData();
    payload.append("title", form.title);
    payload.append("author", form.author);
    payload.append("quantity", Number(form.quantity));
    if (form.image) {
      payload.append("image", form.image);
    }
    onSubmit(payload);
  };

  return (
    <form className="card-surface space-y-5 p-6" onSubmit={handleSubmit}>
      <div>
        <h2 className="text-2xl font-semibold text-app-text"><span className="mr-2 text-[#8B5E3C]" aria-hidden="true">▤</span>{submitLabel}</h2>
        <p className="mt-1 text-sm text-app-copy">
          Keep your inventory up to date with title, author, stock, and cover image.
        </p>
      </div>

      <ErrorAlert message={error} />

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-app-label">Title</label>
          <input
            type="text"
            name="title"
            className="input-field"
            value={form.title}
            onChange={handleChange}
            placeholder="Atomic Habits"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-app-label">Author</label>
          <input
            type="text"
            name="author"
            className="input-field"
            value={form.author}
            onChange={handleChange}
            placeholder="James Clear"
            required
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-app-label">Quantity</label>
          <input
            type="number"
            min="0"
            step="1"
            name="quantity"
            className="input-field"
            value={form.quantity}
            onChange={handleChange}
            placeholder="10"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-app-label">Cover Image</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            className="input-field file:mr-3 file:rounded-xl file:border-0 file:bg-primary-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-800"
            onChange={handleChange}
          />
        </div>
      </div>

      <button type="submit" className="btn-primary w-full" disabled={loading}>
        <span className="mr-2" aria-hidden="true">{loading ? "◌" : "✓"}</span>{loading ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

export default BookForm;
