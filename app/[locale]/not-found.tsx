import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const t = useTranslations('errors.404');

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-muted-foreground mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">{t('title')}</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          {t('description')}
        </p>
        <Button asChild>
          <Link href="/">
            {t('backHome')}
          </Link>
        </Button>
      </div>
    </div>
  );
}
