export default function UsersPage({ params }: { params: { locale: string } }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <div className="text-sm text-gray-500">Locale: {params.locale}</div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Users page content goes here.</p>
      </div>
    </div>
  );
}
