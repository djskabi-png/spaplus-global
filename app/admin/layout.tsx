import "./admin-typography.css";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="admin-font-lock">{children}</div>;
}
