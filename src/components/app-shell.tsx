"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { SessionUser } from "@/lib/auth";
import { navigationForRole, roleLabel } from "@/lib/roles";
import { LogoutButton } from "./logout-button";

type AppShellProps = {
  user: SessionUser;
  children: React.ReactNode;
};

export function AppShell({ user, children }: AppShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = navigationForRole(user.role);

  return (
    <div className="shell">
      <header className="topbar">
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="app-nav"
          onClick={() => setOpen((value) => !value)}
        >
          Menu
        </button>
        <div className="brand-lockup">
          <span className="brand-mark">Key2HR</span>
          <span className="brand-sub">{roleLabel(user.role)}</span>
        </div>
        <div className="topbar-user">
          <span className="user-name">{user.displayName}</span>
          <LogoutButton />
        </div>
      </header>

      <div className="shell-body">
        <aside
          id="app-nav"
          className={`sidebar ${open ? "sidebar-open" : ""}`}
          aria-label="Primary"
        >
          <nav>
            <ul>
              {items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== `/${user.role}` &&
                    pathname.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={active ? "nav-link active" : "nav-link"}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                    >
                      <span>{item.label}</span>
                      {item.placeholder ? (
                        <span className="nav-chip">Soon</span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {open ? (
          <button
            className="sidebar-backdrop"
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
        ) : null}

        <main className="content">{children}</main>
      </div>
    </div>
  );
}
