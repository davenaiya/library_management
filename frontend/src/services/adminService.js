import api from "./api";

export const getDashboard = async () => {
  const { data } = await api.get("/dashboard");
  return data;
};

export const getInventorySummary = async () => {
  const { data } = await api.get("/admin/inventory-summary");
  return data;
};

export const getAllIssues = async () => {
  const { data } = await api.get("/admin/issues");
  return data;
};

export const downloadLibraryReport = async () => {
  const response = await api.get("/admin/report/pdf", {
    responseType: "blob"
  });
  return response.data;
};

export const getUsers = async (params) => {
  const { data } = await api.get("/admin/users", { params });
  return data;
};

export const createUser = async (payload) => {
  const { data } = await api.post("/admin/users", payload);
  return data;
};

export const updateUser = async (id, payload) => {
  const { data } = await api.put(`/admin/users/${id}`, payload);
  return data;
};

export const deleteUser = async (id) => {
  const { data } = await api.delete(`/admin/users/${id}`);
  return data;
};
