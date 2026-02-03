
import React from 'react';
import { FinancialSummary } from '../types';

interface DashboardProps {
  summary: FinancialSummary;
}

const Dashboard: React.FC<DashboardProps> = ({ summary }) => {
  const cards = [
    {
      title: 'Total Revenue',
      value: `₹${summary.totalRevenue.toLocaleString('en-IN')}`,
      icon: 'fa-solid fa-money-bill-trend-up',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      description: 'Sum of all non-cancelled totals'
    },
    {
      title: 'Active Orders',
      value: summary.activeReceiptCount,
      icon: 'fa-solid fa-receipt',
      color: 'bg-blue-50 text-blue-600 border-blue-100',
      description: 'Total active receipts processed'
    },
    {
      title: 'Total Discounts',
      value: `₹${summary.totalDiscount.toLocaleString('en-IN')}`,
      icon: 'fa-solid fa-tag',
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      description: 'Total value of discounts applied'
    },
    {
      title: 'Cancelled Total',
      value: `₹${summary.totalCancelled.toLocaleString('en-IN')}`,
      icon: 'fa-solid fa-ban',
      color: 'bg-rose-50 text-rose-600 border-rose-100',
      description: `${summary.cancelledReceiptCount} cancelled transactions`
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div 
          key={idx} 
          className={`p-5 rounded-xl border ${card.color} shadow-sm transition-transform hover:scale-[1.02] cursor-default`}
        >
          <div className="flex justify-between items-start mb-4">
            <span className="p-2 rounded-lg bg-white/50 backdrop-blur-sm">
              <i className={`${card.icon} text-lg`}></i>
            </span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium mb-1">{card.title}</h3>
          <div className="text-2xl font-bold text-slate-900 mb-1">{card.value}</div>
          <p className="text-[10px] uppercase tracking-wider font-semibold opacity-70">
            {card.description}
          </p>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
