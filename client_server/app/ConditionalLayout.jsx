'use client';

import { usePathname } from 'next/navigation';
import Header from './ui/layout/header';
import Footer from './ui/layout/footer';

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  
  if (isAdminRoute) {
    return children;
  }
  
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}