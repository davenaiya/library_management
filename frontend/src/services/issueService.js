import api from "./api";

export const requestIssue = async (bookId) => {
  const { data } = await api.post("/issues", { bookId });
  return data;
};

export const getMyBooks = async (params) => {
  const { data } = await api.get("/issues/my-books", { params });
  return data;
};

export const approveIssue = async (id) => {
  const { data } = await api.put(`/issues/approve/${id}`);
  return data;
};

export const rejectIssue = async (id) => {
  const { data } = await api.put(`/issues/reject/${id}`);
  return data;
};

export const returnIssue = async (id) => {
  const { data } = await api.put(`/issues/return/${id}`);
  return data;
};

export const getOverdueIssues = async () => {
  const { data } = await api.get("/issues/overdue");
  return data;
};

export const getFineList = async () => {
  const { data } = await api.get("/issues/fines");
  return data;
};
