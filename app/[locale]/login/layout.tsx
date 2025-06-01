import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

interface LoginLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: LoginLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth.login' });
  
  return {
    title: `${t('title')} | chienchuanw`,
    description: t('subtitle'),
  };
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
