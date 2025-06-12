'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function MobileHeader({
  t,
  params,
  avatarUrl,
  displayName,
}: {
  t: unknown;
  params: { locale: string };
  avatarUrl: string;
  displayName: string;
}) {
  return (
    <header className="lg:hidden bg-white border-b border-gray-200 py-4 px-4">
      <div className="flex items-center justify-between">
        <button
          id="mobile-menu-button"
          className="text-slate focus:outline-none"
          aria-label={t.menu}
          onClick={() => {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
              sidebar.classList.toggle('-translate-x-full');
            }
          }}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </button>

        <Link
          href={`/dashboard/${params.locale}`}
          className="flex items-center space-x-2 no-underline"
        >
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <span className="text-primary font-semibold text-lg">
            TradeNavigatorPro
          </span>
        </Link>

        {/* Mobile User Menu */}
        <div className="relative group">
          <button
            className="flex items-center focus:outline-none"
            title="Open user menu"
          >
            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
              <Image
                src={avatarUrl}
                alt={displayName}
                width={32}
                height={32}
                className="object-cover"
              />
            </div>
          </button>

          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
            <div className="py-1">
              <Link
                href={`/dashboard/${params.locale}/profile`}
                className="block px-4 py-2 text-sm text-slate hover:bg-secondary no-underline"
              >
                {t.profile}
              </Link>
              <Link
                href={`/dashboard/${params.locale}/settings`}
                className="block px-4 py-2 text-sm text-slate hover:bg-secondary no-underline"
              >
                {t.account}
              </Link>
              <Link
                href={`/dashboard/${params.locale}/billing`}
                className="block px-4 py-2 text-sm text-slate hover:bg-secondary no-underline"
              >
                {t.billing}
              </Link>
              <form action="/api/auth/signout" method="post">
                <button
                  type="submit"
                  className="block w-full text-left px-4 py-2 text-sm text-slate hover:bg-secondary"
                >
                  {t.logout}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
