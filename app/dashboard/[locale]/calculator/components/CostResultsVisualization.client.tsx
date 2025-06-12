'use client';
import React from 'react';

interface CostResultsVisualizationProps {
  results: unknown;
}

const industryBenchmarks = {
  materials: 0.5, // 50% typical
  labor: 0.3, // 30% typical
  overhead: 0.2, // 20% typical
};

function getInsights(breakdown: unknown, total: number) {
  const insights = [];
  if (!total || total === 0) return insights;
  const materialPct = breakdown.materials / total;
  const laborPct = breakdown.labor / total;
  const overheadPct = breakdown.overhead / total;

  // 🔴 URGENT: Material costs are too high
  if (materialPct > 0.65) {
    insights.push({
      level: 'urgent',
      title: 'High Material Cost',
      issue: `Material costs are ${Math.round(materialPct * 100)}% of total`,
      impact: 'Reduces profit margin significantly',
      action: 'Request bulk pricing or alternative suppliers',
      potential: 'Potential to save by reducing material spend',
    });
  } else if (materialPct > 0.5) {
    insights.push({
      level: 'warning',
      title: 'Material Cost Above Typical',
      issue: `Material costs are ${Math.round(materialPct * 100)}% (typical: <50%)`,
      impact: 'May reduce margin',
      action: 'Negotiate with suppliers',
      potential: 'Aim for <50% material cost',
    });
  } else {
    insights.push({
      level: 'insight',
      title: 'Material Cost Healthy',
      issue: `Material costs are ${Math.round(materialPct * 100)}%`,
      impact: 'Within typical range',
      action: 'Maintain supplier relationships',
      potential: '',
    });
  }

  // Labor cost
  if (laborPct > 0.45) {
    insights.push({
      level: 'urgent',
      title: 'High Labor Cost',
      issue: `Labor costs are ${Math.round(laborPct * 100)}% of total`,
      impact: 'Profitability at risk',
      action: 'Review labor efficiency and automation',
      potential: 'Potential to save by improving processes',
    });
  } else if (laborPct > 0.35) {
    insights.push({
      level: 'warning',
      title: 'Labor Cost Above Typical',
      issue: `Labor costs are ${Math.round(laborPct * 100)}% (typical: <35%)`,
      impact: 'May reduce margin',
      action: 'Cross-train or optimize shifts',
      potential: 'Aim for <35% labor cost',
    });
  } else {
    insights.push({
      level: 'insight',
      title: 'Labor Cost Healthy',
      issue: `Labor costs are ${Math.round(laborPct * 100)}%`,
      impact: 'Within typical range',
      action: 'Maintain workforce efficiency',
      potential: '',
    });
  }

  // Overhead cost
  if (overheadPct > 0.25) {
    insights.push({
      level: 'warning',
      title: 'High Overhead',
      issue: `Overhead is ${Math.round(overheadPct * 100)}% (typical: <20%)`,
      impact: 'Overhead may be too high',
      action: 'Review rent, utilities, and indirect costs',
      potential: 'Reduce overhead to improve margin',
    });
  } else {
    insights.push({
      level: 'insight',
      title: 'Overhead Healthy',
      issue: `Overhead is ${Math.round(overheadPct * 100)}%`,
      impact: 'Within typical range',
      action: 'Monitor regularly',
      potential: '',
    });
  }

  // Break-even quantity (if perUnitCost and a target price is available)
  // For demo, assume a target price of 120% of per unit cost
  if (breakdown.perUnitCost) {
    const targetPrice = breakdown.perUnitCost * 1.2;
    const breakEvenQty = Math.ceil(
      total / (targetPrice - breakdown.perUnitCost)
    );
    insights.push({
      level: 'insight',
      title: 'Break-even Analysis',
      issue: `Break-even quantity: ${breakEvenQty} units (at 20% markup)`,
      impact: '',
      action: 'Sell at least this quantity to cover costs',
      potential: '',
    });
  }

  return insights;
}

const InsightCard = ({ insight }: { insight: unknown }) => {
  const color =
    insight.level === 'urgent'
      ? 'border-red-500 bg-red-50'
      : insight.level === 'warning'
        ? 'border-yellow-500 bg-yellow-50'
        : 'border-blue-500 bg-blue-50';
  const icon =
    insight.level === 'urgent'
      ? '🔴'
      : insight.level === 'warning'
        ? '🟡'
        : '💡';
  return (
    <div className={`border-l-4 p-4 mb-2 rounded ${color}`}>
      <div className="flex items-center mb-1">
        <span className="mr-2 text-xl">{icon}</span>
        <span className="font-semibold">{insight.title}</span>
      </div>
      <div className="text-sm text-slate-700 mb-1">{insight.issue}</div>
      {insight.impact && (
        <div className="text-xs text-slate-500 mb-1">
          Impact: {insight.impact}
        </div>
      )}
      {insight.action && (
        <div className="text-xs text-slate-600">Action: {insight.action}</div>
      )}
      {insight.potential && (
        <div className="text-xs text-green-700">
          Potential: {insight.potential}
        </div>
      )}
    </div>
  );
};

const CostResultsVisualization: React.FC<CostResultsVisualizationProps> = ({
  results,
}) => {
  if (!results) {
    return <div className="text-gray-500">No results to display.</div>;
  }

  // Calculate insights
  const insights = getInsights(
    results.breakdown || results,
    results.totalCost || results.total
  );

  return (
    <div className="my-4 p-4 bg-white rounded shadow">
      <h3 className="text-lg font-semibold mb-2">Cost Breakdown</h3>
      <table className="min-w-full divide-y divide-gray-200 mb-4">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">Item</th>
            <th className="px-4 py-2 text-left">Amount</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(results.breakdown || results).map(([key, value]) => (
            <tr key={key}>
              <td className="px-4 py-2 capitalize">{key.replace(/_/g, ' ')}</td>
              <td className="px-4 py-2">
                {typeof value === 'number'
                  ? value.toLocaleString()
                  : String(value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Insights Section */}
      <div className="mb-2">
        {insights.map((insight, idx) => (
          <InsightCard key={idx} insight={insight} />
        ))}
      </div>
    </div>
  );
};

export default CostResultsVisualization;
