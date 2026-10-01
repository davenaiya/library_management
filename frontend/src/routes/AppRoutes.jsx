import { Navigate, Route, Routes } from "react-router-dom";
import AddBook from "../pages/AddBook";
import AdminPanel from "../pages/AdminPanel";
import BookList from "../pages/BookList";
import ChangePassword from "../pages/ChangePassword";
import Dashboard from "../pages/Dashboard";
import ForgotPassword from "../pages/ForgotPassword";
import Login from "../pages/Login";
import MyBooks from "../pages/MyBooks";
import NotFound from "../pages/NotFound";
import PasswordUpdated from "../pages/PasswordUpdated";
import Profile from "../pages/Profile";
import Register from "../pages/Register";
import Requests from "../pages/Requests";
import ResetPassword from "../pages/ResetPassword";
import { useAuth } from "../hooks/useAuth";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

function HomeRedirect() {
  const { isAuthenticated, bootstrapping } = useAuth();

  if (bootstrapping) {
    return null;
  }

  return <Navigate to={isAuthenticated ? "/dashboard" : "/books"} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/books" element={<BookList />} />

      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/my-books" element={<MyBooks />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/password-updated" element={<PasswordUpdated />} />
      </Route>

      <Route element={<ProtectedRoute roles={["librarian", "admin"]} />}>
        <Route path="/add-book" element={<AddBook />} />
      </Route>

      <Route element={<ProtectedRoute roles={["admin", "librarian"]} />}>
        <Route path="/requests" element={<Requests />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
