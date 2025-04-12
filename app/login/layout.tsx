import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '登入 | 我的網站',
  description: '登入到您的帳戶',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
