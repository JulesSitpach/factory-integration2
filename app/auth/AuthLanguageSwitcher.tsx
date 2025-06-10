'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AuthLanguageSwitcherProps {
  locale: string;
  t: { english: string; spanish: string };
}

export default function AuthLanguageSwitcher({
  locale,
  t,
}: AuthLanguageSwitcherProps) {
  const pathname = usePathname();
  // Remove current locale from path for switching
  const basePath = pathname.replace(new RegExp(`^/auth/(en|es)`), '/auth');
  return (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
      <div className="py-1">
        <Link
          href={`/auth/en${locale !== 'en' ? basePath.replace(/^\/auth/, '') : ''}`}
          className="block px-4 py-2 text-sm text-slate hover:bg-secondary no-underline"
        >
          {t.english}
        </Link>
        <Link
          href={`/auth/es${locale !== 'es' ? basePath.replace(/^\/auth/, '') : ''}`}
          className="block px-4 py-2 text-sm text-slate hover:bg-secondary no-underline"
        >
          {t.spanish}
        </Link>
      </div>
    </div>
  );
}
