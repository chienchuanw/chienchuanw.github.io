// 這是一個伺服器元件
import type { Metadata } from "next";
import "../globals.css";
import "./admin-globals.css";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "管理員後台介面",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="admin-layout">{children}</div>;
}
