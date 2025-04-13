// 這是一個伺服器元件
import type { Metadata } from "next";
import "../globals.css";
import "./admin-globals.css";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin Interface",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-layout">
      <div className="pt-8">{children}</div>
    </div>
  );
}
