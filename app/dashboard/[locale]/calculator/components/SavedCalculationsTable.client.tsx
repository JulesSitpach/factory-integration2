'use client';
import React from 'react';

interface SavedCalculation {
  id: string;
  name?: string;
  totalCost: number;
  createdAt: string;
}

interface SavedCalculationsTableProps {
  calculations: SavedCalculation[];
  onSelect: (id: string) => void;
}

const SavedCalculationsTable: React.FC<SavedCalculationsTableProps> = ({
  calculations,
  onSelect,
}) => {
  if (!calculations || calculations.length === 0) {
    return <div className="text-gray-500">No saved calculations found.</div>;
  }

  return (
    <div className="my-4 p-4 bg-white rounded shadow">
      <h3 className="text-lg font-semibold mb-2">Saved Calculations</h3>
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Total Cost</th>
            <th className="px-4 py-2 text-left">Created At</th>
            <th className="px-4 py-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {calculations.map(calc => (
            <tr key={calc.id}>
              <td className="px-4 py-2">{calc.name || 'Untitled'}</td>
              <td className="px-4 py-2">{calc.totalCost.toLocaleString()}</td>
              <td className="px-4 py-2">
                {new Date(calc.createdAt).toLocaleString()}
              </td>
              <td className="px-4 py-2">
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => onSelect(calc.id)}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SavedCalculationsTable;
