"use client";

import Link from "next/link";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  redirectTo?: string;
}

interface State {
  failed: boolean;
}

export class ClerkErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[auth] Clerk widget failed to render", error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <div className="rounded-card border border-hairline bg-surface p-8 text-center shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
          Sign-in
        </p>
        <h1 className="mt-3 font-serif text-3xl italic text-ink">
          We couldn&apos;t load the sign-in form.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          This is usually a temporary connection or Clerk configuration issue.
          Try again, or keep building in the browser.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-ink px-5 text-sm font-medium text-canvas"
          >
            Try again
          </button>
          <Link
            href={this.props.redirectTo ?? "/dashboard"}
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-hairline bg-canvas px-5 text-sm font-medium text-ink hover:bg-hover"
          >
            Continue
          </Link>
        </div>
      </div>
    );
  }
}
