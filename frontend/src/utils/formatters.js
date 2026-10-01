import { API_ORIGIN } from "../services/api";

export const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      })
    : "-";

export const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2
  }).format(Number(value || 0));

export const toImageUrl = (imagePath) => {
  const normalizedImagePath = Array.isArray(imagePath) ? imagePath[0] : imagePath;

  if (!normalizedImagePath) {
    return "https://placehold.co/600x800/e2e8f0/475569?text=Library+Book";
  }

  if (/^https?:\/\//i.test(normalizedImagePath)) {
    return normalizedImagePath;
  }

  return `${API_ORIGIN}${normalizedImagePath.startsWith("/") ? normalizedImagePath : `/${normalizedImagePath}`}`;
};
