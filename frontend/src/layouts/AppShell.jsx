import { useState } from "react";
import Navbar from "../components/Navbar";

function AppShell({ title, subtitle, actions, children, centerTitle = false, eyebrow = "Library Workspace" }) {
  const [desktopNavExpanded, setDesktopNavExpanded] = useState(true);

  return (
    <div className="dashboard-shell" style={{ "--sidebar-width": desktopNavExpanded ? "280px" : "88px" }}>
      <Navbar
        desktopExpanded={desktopNavExpanded}
        onToggleDesktop={() => setDesktopNavExpanded((expanded) => !expanded)}
      />
      <div className="page-shell min-w-0">
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div
            className={`mb-8 flex flex-col gap-4 ${
              centerTitle ? "text-center lg:relative lg:items-center" : "lg:flex-row lg:items-end lg:justify-between"
            }`}
          >
            <div className={centerTitle ? "mx-auto max-w-3xl" : ""}>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8B5E3C]">{eyebrow}</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#5C3A21] sm:text-4xl">{title}</h1>
              {subtitle ? (
                <p className={`mt-2 text-sm leading-6 text-[#5C3A21]/70 ${centerTitle ? "mx-auto max-w-2xl" : "max-w-2xl"}`}>
                  {subtitle}
                </p>
              ) : null}
            </div>
            {actions ? (
              <div
                className={`flex flex-wrap gap-3 ${
                  centerTitle ? "justify-center sm:justify-end lg:absolute lg:right-0 lg:top-0" : ""
                }`}
              >
                {actions}
              </div>
            ) : null}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppShell;
