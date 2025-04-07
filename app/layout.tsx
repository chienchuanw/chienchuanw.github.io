import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import Tags from "@/components/shared/Tags";

export const metadata: Metadata = {
  title: "shadcn blog",
  description: "a blog use Next.js and shadcn/ui",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <Tags />
        <main>{children}</main>
      </body>
    </html>
  );
}
