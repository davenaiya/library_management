import api from "./api";

export const getBooks = async (params) => {
  const { data } = await api.get("/books", { params });
  return data;
};

export const getInventory = async () => {
  const { data } = await api.get("/books/inventory");
  return data;
};

export const getLowStockBooks = async () => {
  const { data } = await api.get("/books/low-stock");
  return data;
};

export const createBook = async (payload) => {
  const { data } = await api.post("/books", payload, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return data;
};

export const updateBook = async (id, payload) => {
  const { data } = await api.put(`/books/${id}`, payload, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return data;
};

export const deleteBook = async (id) => {
  const { data } = await api.delete(`/books/${id}`);
  return data;
};
