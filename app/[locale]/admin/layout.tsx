import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import "../../globals.css";
import "../admin-globals.css";

interface AdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: AdminLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.dashboard' });
  
  return {
    title: `${t('title')} | chienchuanw`,
    description: t('welcome'),
  };
}

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
