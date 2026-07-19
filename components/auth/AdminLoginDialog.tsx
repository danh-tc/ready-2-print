"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import "./admin-login-dialog.scss";

interface Props {
  readonly open: boolean;
  readonly onClose: () => void;
}

export function AdminLoginDialog({ open, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Reset form khi đóng
  useEffect(() => {
    if (open) {
      setTimeout(() => emailRef.current?.focus(), 50);
    } else {
      setEmail("");
      setPassword("");
      setError(null);
      setLoading(false);
    }
  }, [open]);

  // Đóng bằng Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    globalThis.addEventListener("keydown", handler);
    return () => globalThis.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Refresh server data (presets) sau khi login
    router.refresh();
    onClose();
  };

  return (
    <div
      className="admin-dialog-overlay"
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        className="admin-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Admin Login"
      >
        <h2 className="admin-dialog__title">Admin Login</h2>

        <form onSubmit={handleSubmit} className="admin-dialog__form">
          <div className="admin-dialog__field">
            <label htmlFor="admin-email">Email</label>
            <input
              id="admin-email"
              ref={emailRef}
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="admin-dialog__field">
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          {error && (
            <p className="admin-dialog__error" role="alert">
              {error}
            </p>
          )}

          <div className="admin-dialog__actions">
            <button
              type="button"
              className="rethink-btn rethink-btn--outline rethink-btn--md"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`rethink-btn rethink-btn--primary rethink-btn--md${loading ? " admin-dialog__btn--loading" : ""}`}
              disabled={loading}
            >
              {loading ? (
                <span className="admin-dialog__btn-inner">
                  <span className="admin-dialog__spinner" aria-hidden="true" />
                  Logging in…
                </span>
              ) : (
                "Login"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
