"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { createClient } from "@/lib/supabase/client";
import { AdminLoginDialog } from "@/components/auth/AdminLoginDialog";
import "./header.scss";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Configuration", href: "/configuration" },
  { label: "Imposition", href: "/imposition" },
];

interface AuthButtonProps {
  loading: boolean;
  isAdmin: boolean;
  loggingOut: boolean;
  handleLogout: () => void;
  openLogin: () => void;
}

function renderAuthButton({ loading, isAdmin, loggingOut, handleLogout, openLogin }: AuthButtonProps) {
  if (loading) {
    return <div className="rethink-header__auth-skeleton" aria-hidden="true" />;
  }
  if (isAdmin) {
    return (
      <button
        className="rethink-btn rethink-btn--outline rethink-btn--md"
        onClick={handleLogout}
        disabled={loggingOut}
      >
        {loggingOut ? "Logging out…" : "Logout"}
      </button>
    );
  }
  return (
    <button
      className="rethink-btn rethink-btn--outline rethink-btn--md"
      onClick={openLogin}
    >
      Login
    </button>
  );
}

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { isAdmin, loading } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(globalThis.scrollY > 8);
    onScroll();
    globalThis.addEventListener("scroll", onScroll, { passive: true });
    return () => globalThis.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    setLoggingOut(false);
  };

  return (
    <>
      <header
        className={`rethink-header ${scrolled ? "rethink-header--scrolled" : ""}`}
      >
        <div className="rethink-header__inner rethink-container">
          <Link href="/" className="rethink-header__brand">
            Ready-2-Print
          </Link>

          <nav className="rethink-header__nav" aria-label="Primary">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rethink-header__nav-link${active ? " rethink-header__nav-link--active" : ""}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="rethink-header__utils">
            {renderAuthButton({ loading, isAdmin, loggingOut, handleLogout, openLogin: () => setLoginOpen(true) })}
          </div>
        </div>
      </header>

      <AdminLoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
