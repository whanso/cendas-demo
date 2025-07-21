import { type ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  children?: ReactNode;
}

export function EmptyState({ title, description, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8">
      <div className="opacity-30 grayscale">
        <img src="/logo-empty-state.png" alt="Cendas Logo" style={{ width: 120 }} />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
