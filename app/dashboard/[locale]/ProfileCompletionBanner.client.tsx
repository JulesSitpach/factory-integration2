'use client';
import Link from 'next/link';

export default function ProfileCompletionBanner({
  profileCompletion,
  t,
  locale,
}: {
  profileCompletion: number;
  t: any;
  locale: string;
}) {
  return (
    profileCompletion < 100 && (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-slate">
              {t.profileCompletion}
            </h3>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div
                className="bg-primary h-2.5 rounded-full"
                style={{ width: `${profileCompletion}%` }}
              ></div>
            </div>
            <p className="mt-2 text-sm text-slate/70">
              {profileCompletion}% {t.complete}
            </p>
          </div>
          <div className="mt-4 md:mt-0 md:ml-6">
            <Link
              href={`/dashboard/${locale}/profile`}
              className="btn-primary px-4 py-2"
            >
              {t.configure}
            </Link>
          </div>
        </div>
      </div>
    )
  );
}
