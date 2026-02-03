
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

  const maxRevenue = useMemo(() => {
    const vals = trendData.map(td => td[1]);
    return vals.length > 0 ? Math.max(...vals) : 1;
  }, [trendData]);

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
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Revenue Statistics</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Daily Breakdown (Last 7 Active Days)</p>
            </div>
            <div className="flex items-center gap-2">
               <span className="w-3 h-3 bg-indigo-500 rounded-sm"></span>
               <span className="text-[10px] font-black text-slate-500 uppercase">Revenue (₹)</span>
            </div>
          </div>
          
          <div className="flex-1 flex items-end justify-between gap-4 h-48 px-2 relative">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="border-t border-slate-50 w-full"></div>
              <div className="border-t border-slate-50 w-full"></div>
              <div className="border-t border-slate-50 w-full"></div>
              <div className="border-t border-slate-100 w-full"></div>
            </div>

            {trendData.length > 0 ? trendData.map(([date, revenue], i) => {
              const heightPercentage = (revenue / maxRevenue) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                    ₹{revenue.toLocaleString('en-IN')}
                  </div>
                  <div 
                    className="w-full max-w-[40px] bg-indigo-500 rounded-t-lg group-hover:bg-indigo-600 transition-all duration-300 relative"
                    style={{ height: `${Math.max(heightPercentage, 2)}%` }}
                  >
                    <div className="absolute inset-x-0 top-0 h-1/2 bg-white/10 rounded-t-lg"></div>
                  </div>
                  <div className="mt-3 text-[9px] font-black text-slate-400 uppercase transform -rotate-45 sm:rotate-0 origin-center whitespace-nowrap">
                    {new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </div>
                </div>
              );
            }) : (
              <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl">
                 <div className="text-center">
                    <i className="fa-solid fa-chart-simple text-slate-200 text-3xl mb-3"></i>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Transaction Data Found</p>
                 </div>
              </div>
            )}
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
                  const colors: any = { 
                    [ReceiptStatus.PAID]: '#10b981', 
                    [ReceiptStatus.COMPLETED]: '#14b8a6',
                    [ReceiptStatus.PENDING]: '#f59e0b', 
                    [ReceiptStatus.CANCELLED]: '#f43f5e', 
                    [ReceiptStatus.WORK_IN_PROGRESS]: '#3b82f6' 
                  };
                  return <circle key={status} cx="18" cy="18" r="15.9" fill="none" stroke={colors[status]} strokeWidth="3" strokeDasharray={`${percent} ${100 - percent}`} strokeDashoffset={-offset} strokeLinecap="round" />;
               })}
             </svg>
             <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-xl font-black text-slate-900 leading-none">{receipts.length}</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase mt-1">Total Items</span>
             </div>
          </div>
          <div className="grid grid-cols-2 gap-2 w-full">
            {statuses.map(s => <div key={s} className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase"><div className={`w-1.5 h-1.5 rounded-full ${s === ReceiptStatus.PAID ? 'bg-emerald-500' : s === ReceiptStatus.COMPLETED ? 'bg-teal-500' : s === ReceiptStatus.PENDING ? 'bg-amber-500' : s === ReceiptStatus.CANCELLED ? 'bg-rose-500' : 'bg-blue-500'}`}></div>{s}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;