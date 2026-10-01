import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const roleLinks = {
  guest: [
    { label: "Books", to: "/books" }
  ],
  member: [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Books", to: "/books" },
    { label: "My Books", to: "/my-books" },
    { label: "Profile", to: "/profile" }
  ],
  librarian: [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Books", to: "/books" },
    { label: "Add Book", to: "/add-book" },
    { label: "Requests", to: "/requests" },
    { label: "Members", to: "/admin" },
    { label: "Profile", to: "/profile" }
  ],
  admin: [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Books", to: "/books" },
    { label: "Add Book", to: "/add-book" },
    { label: "Requests", to: "/requests" },
    { label: "Admin Panel", to: "/admin" },
    { label: "Profile", to: "/profile" }
  ]
};

function Navbar({ desktopExpanded = true, onToggleDesktop = () => {} }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const links = roleLinks[user?.role || "guest"] || [];

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const menuIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );

  const navIcons = {
    Dashboard: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 13h7V4H4v9Zm9 7h7V11h-7v9Zm0-16v5h7V4h-7ZM4 20h7v-5H4v5Z" />
      </svg>
    ),
    Books: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 4.5A2.5 2.5 0 0 0 3.5 7v10A2.5 2.5 0 0 1 6 14.5h14v-8a2 2 0 0 0-2-2H6Zm0 0v10m0 0a2.5 2.5 0 0 0-2.5 2.5M20 14.5v2a2 2 0 0 1-2 2H6" />
      </svg>
    ),
    Login: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3M10 17l5-5m0 0-5-5m5 5H4" />
      </svg>
    ),
    Register: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19a4 4 0 0 0-8 0m4-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 8v-6m-3 3h6" />
      </svg>
    ),
    "My Books": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
      </svg>
    ),
    Profile: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm4 12a7 7 0 0 0-14 0" />
      </svg>
    ),
    "Change Password": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10V7.75a4.5 4.5 0 1 0-9 0V10m-1 0h11a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z" />
      </svg>
    ),
    Members: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20a5 5 0 0 0-10 0m13 0a3 3 0 0 0-2.5-2.96M17 20H7m10-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM7 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      </svg>
    ),
    Requests: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
      </svg>
    ),
    "Add Book": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
      </svg>
    ),
    "Admin Panel": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 19h16M6 17V9m6 8V5m6 12v-4" />
      </svg>
    )
  };

  const renderSidebarContent = (compact = false) => (
    <div className="flex h-full flex-col">
      <div className={`flex items-center py-6 ${compact ? "justify-between gap-1 px-1" : "justify-between gap-3 px-5"}`}>
        <div className={`flex items-center ${compact ? "" : "gap-3"}`}>
          <div className={`${compact ? "h-9 w-9 text-sm" : "h-12 w-12 text-lg"} flex shrink-0 items-center justify-center rounded-2xl bg-white/15 font-bold text-white ring-1 ring-white/20 backdrop-blur-sm`}>
            LM
          </div>
          {!compact && (
            <div>
              <p className="text-base font-semibold text-white">Library System</p>
              <p className="text-xs uppercase tracking-[0.22em] text-[#F5EDE6]">Dashboard</p>
            </div>
          )}
        </div>
        <button
          type="button"
          className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/70 md:inline-flex"
          onClick={onToggleDesktop}
          aria-label={desktopExpanded ? "Collapse sidebar" : "Expand sidebar"}
          title={desktopExpanded ? "Collapse sidebar" : "Expand sidebar"}
          aria-expanded={desktopExpanded}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d={desktopExpanded ? "m14 6-6 6 6 6" : "m10 6 6 6-6 6"} />
          </svg>
        </button>
        <button
          type="button"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/70 md:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close navigation menu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>
      </div>

      <div className={compact ? "flex justify-center px-2" : "px-5"}>
        {compact ? (
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-sm font-semibold uppercase text-white" title={user?.name || "Workspace"}>
            {(user?.name || "Guest").charAt(0)}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm transition-all duration-300">
            <p className="text-sm font-semibold text-white">{user?.name || "Workspace"}</p>
            <p className="mt-1 break-all text-xs text-[#F5EDE6]">{user?.email || "Browse as a visitor"}</p>
            <span className="mt-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold capitalize text-white ring-1 ring-white/10">
              {user?.role || "guest"}
            </span>
          </div>
        )}
      </div>

      <nav className={`mt-6 flex-1 space-y-1 ${compact ? "px-3" : "px-4"}`} aria-label="Main navigation">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={() => setOpen(false)}
            title={compact ? link.label : undefined}
            aria-label={link.label}
            className={({ isActive }) =>
              `flex items-center rounded-lg border-l-4 py-3 text-sm font-medium transition-all duration-200 ${compact ? "justify-center px-2" : "gap-3 px-4"} ${
                isActive
                  ? "border-[#8B5E3C] bg-white text-[#8B5E3C] shadow-sm"
                  : "border-transparent text-white hover:bg-[#F5EDE6] hover:text-[#5C3A21]"
              }`
            }
          >
            <span className="rounded-lg bg-white/15 p-2">
              {navIcons[link.label] || navIcons.Dashboard}
            </span>
            {!compact && <span>{link.label}</span>}
          </NavLink>
        ))}
      </nav>

      {user ? (
        <div className={`border-t border-white/10 ${compact ? "p-3" : "p-4"}`}>
          <button
            type="button"
            className={`inline-flex w-full items-center justify-center rounded-xl border border-white/15 bg-white/10 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#F5EDE6] hover:text-[#5C3A21] ${compact ? "px-2" : "gap-2 px-4"}`}
            onClick={handleLogout}
            aria-label="Logout"
            title={compact ? "Logout" : undefined}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 17l5-5m0 0-5-5m5 5H4m12-8h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
            </svg>
            {!compact && "Logout"}
          </button>
        </div>
      ) : null}
    </div>
  );

  return (
    <>
      <div className="sticky top-0 z-40 border-b border-[#8B5E3C]/10 bg-[#F8F9FB]/95 px-4 py-4 backdrop-blur md:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link to={user ? "/dashboard" : "/books"} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-b from-[#5C3A21] to-[#8B5E3C] text-sm font-bold text-white shadow-sm">
              LM
            </div>
            <div>
              <p className="text-sm font-semibold text-[#5C3A21]">Library System</p>
              <p className="text-xs capitalize text-[#8B5E3C]">{user?.role || "guest"}</p>
            </div>
          </Link>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-[#8B5E3C]/15 bg-white px-3 py-2 text-sm font-medium text-[#5C3A21] transition-all duration-300 hover:bg-[#F5EDE6]"
            onClick={() => setOpen((current) => !current)}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          >
            {menuIcon}
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 bg-[#5C3A21]/25 md:hidden" onClick={() => setOpen(false)}>
          <aside
            id="mobile-navigation"
            className="h-full w-[280px] border-r border-white/10 bg-gradient-to-b from-[#5C3A21] to-[#8B5E3C] shadow-lg"
            onClick={(event) => event.stopPropagation()}
            aria-label="Mobile navigation"
          >
            {renderSidebarContent()}
          </aside>
        </div>
      ) : null}

      <aside className={`hidden min-w-0 border-r border-white/10 bg-gradient-to-b from-[#5C3A21] to-[#8B5E3C] md:flex md:min-h-screen md:flex-col ${desktopExpanded ? "" : "items-center"}`}>
        {renderSidebarContent(!desktopExpanded)}
      </aside>
    </>
  );
}

export default Navbar;
