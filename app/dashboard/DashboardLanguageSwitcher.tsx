'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface DashboardLanguageSwitcherProps {
  locale: string;
}

export default function DashboardLanguageSwitcher({
  locale,
}: DashboardLanguageSwitcherProps) {
  const pathname = usePathname();
  // Remove current locale from path for switching
  const basePath = pathname.replace(/^\/dashboard\/(en|es)/, '/dashboard');
  return (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
      <div className="py-1">
        <Link
          href={`/dashboard/en${locale !== 'en' ? basePath : ''}`}
          className="block px-4 py-2 text-sm text-slate hover:bg-secondary no-underline"
        >
          English
        </Link>
        <Link
          href={`/dashboard/es${locale !== 'es' ? basePath : ''}`}
          className="block px-4 py-2 text-sm text-slate hover:bg-secondary no-underline"
        >
          Español
        </Link>
      </div>
    </div>
  );
}
