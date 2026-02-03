
import React, { useMemo } from 'react';
import { FinancialSummary, Receipt, ReceiptStatus } from '../types.ts';

interface DashboardProps {
  summary: FinancialSummary;
  receipts: Receipt[];
}

const Dashboard: React.FC<DashboardProps> = ({ summary, receipts }) => {
  const statusCounts = receipts.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statuses = Object.values(ReceiptStatus);
  const totalCount = receipts.length || 1;

  const trendData = useMemo(() => {
    const dailyData: Record<string, number> = {};
    receipts
      .filter(r => r.status !== ReceiptStatus.CANCELLED)
      .forEach(r => {
        dailyData[r.date] = (dailyData[r.date] || 0) + r.totalAmount;
      });
    return Object.entries(dailyData)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-7);
  }, [receipts]);

  const topItems = useMemo(() => {
    const itemMap: Record<string, { revenue: number, qty: number }> = {};
    receipts.forEach(r => {
      if (r.status === ReceiptStatus.CANCELLED) return;
      const desc = r.itemDescription.trim();
      if (!itemMap[desc]) itemMap[desc] = { revenue: 0, qty: 0 };
      itemMap[desc].revenue += r.totalAmount;
      itemMap[desc].qty += r.quantity;
    });
    return Object.entries(itemMap)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 3);
  }, [receipts]);

  const cards = [
    { title: 'Gross Revenue', value: `₹${summary.totalRevenue.toLocaleString('en-IN')}`, icon: 'fa-solid fa-vault', color: 'from-emerald-500 to-teal-600', count: summary.activeReceiptCount },
    { title: 'Discount Relief', value: `₹${summary.totalDiscount.toLocaleString('en-IN')}`, icon: 'fa-solid fa-percent', color: 'from-indigo-500 to-blue-600', count: 'Total Off' },
    { title: 'Cancelled Status', value: `₹${summary.totalCancelled.toLocaleString('en-IN')}`, icon: 'fa-solid fa-circle-xmark', color: 'from-rose-500 to-pink-600', count: summary.cancelledReceiptCount },
    { title: 'Avg. Transaction', value: `₹${(receipts.length ? (summary.totalRevenue / (summary.activeReceiptCount || 1)) : 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: 'fa-solid fa-calculator', color: 'from-slate-700 to-slate-800', count: 'Active' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => (
          <div key={idx} className={`relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br ${card.color} text-white shadow-lg transition-all hover:-translate-y-1`}>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <span className="p-2 rounded-lg bg-white/20 backdrop-blur-md">
                  <i className={`${card.icon} text-lg text-white`}></i>
                </span>
                <span className="text-[10px] font-black bg-black/10 px-2 py-1 rounded uppercase tracking-tighter">
                  {card.count}
                </span>
              </div>
              <h3 className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">{card.title}</h3>
              <div className="text-2xl font-black mb-2 tracking-tight">{card.value}</div>
            </div>
            <i className={`${card.icon} absolute -right-4 -bottom-4 text-8xl text-white/5 pointer-events-none`}></i>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Revenue Momentum</h3>
          <div className="h-48 w-full relative">
            {trendData.length > 1 ? (
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <polyline fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={trendData.map((d, i) => `${(i / (trendData.length - 1)) * 100},${100 - (d[1] / Math.max(...trendData.map(td => td[1])) * 100)}`).join(' ')} />
                <path className="fill-indigo-50/50" d={`M0,100 ${trendData.map((d, i) => `${(i / (trendData.length - 1)) * 100},${100 - (d[1] / Math.max(...trendData.map(td => td[1])) * 100)}`).join(' ')} L100,100 Z`} />
              </svg>
            ) : <div className="h-full flex items-center justify-center text-slate-300 font-bold uppercase text-xs">Awaiting Data Trend...</div>}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center justify-center">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Status Mix</h3>
          <div className="relative w-32 h-32 mb-6">
             <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
               {statuses.map((status, idx) => {
                  const count = statusCounts[status] || 0;
                  const percent = (count / totalCount) * 100;
                  let offset = 0;
                  for(let i=0; i<idx; i++) offset += ((statusCounts[statuses[i]] || 0) / totalCount) * 100;
                  const colors: any = { [ReceiptStatus.PAID]: '#10b981', [ReceiptStatus.PENDING]: '#f59e0b', [ReceiptStatus.CANCELLED]: '#f43f5e', [ReceiptStatus.PARTIAL]: '#3b82f6' };
                  return <circle key={status} cx="18" cy="18" r="15.9" fill="none" stroke={colors[status]} strokeWidth="3" strokeDasharray={`${percent} ${100 - percent}`} strokeDashoffset={-offset} />;
               })}
             </svg>
             <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-xl font-black text-slate-900 leading-none">{receipts.length}</span>
             </div>
          </div>
          <div className="grid grid-cols-2 gap-2 w-full">
            {statuses.map(s => <div key={s} className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase"><div className={`w-1.5 h-1.5 rounded-full ${s === ReceiptStatus.PAID ? 'bg-emerald-500' : s === ReceiptStatus.PENDING ? 'bg-amber-500' : s === ReceiptStatus.CANCELLED ? 'bg-rose-500' : 'bg-blue-500'}`}></div>{s}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
