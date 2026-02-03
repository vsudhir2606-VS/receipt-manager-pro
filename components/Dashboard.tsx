
import React from 'react';
import { FinancialSummary, Receipt, ReceiptStatus } from '../types.ts';

interface DashboardProps {
  summary: FinancialSummary;
  receipts: Receipt[];
}

const Dashboard: React.FC<DashboardProps> = ({ summary, receipts }) => {
  // Logic for Status Distribution (Pie Chart Helper)
  const statusCounts = receipts.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statuses = Object.values(ReceiptStatus);
  const totalCount = receipts.length || 1;

  // Trend Chart Logic: Group revenue by date
  const trendData = useMemo(() => {
    const dailyData: Record<string, number> = {};
    receipts
      .filter(r => r.status !== ReceiptStatus.CANCELLED)
      .forEach(r => {
        dailyData[r.date] = (dailyData[r.date] || 0) + r.totalAmount;
      });
    
    // Sort by date and take last 7 unique dates for a "Recent Trend"
    return Object.entries(dailyData)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-7);
  }, [receipts]);

  // Top Items Logic
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
    {
      title: 'Gross Revenue',
      value: `₹${summary.totalRevenue.toLocaleString('en-IN')}`,
      icon: 'fa-solid fa-vault',
      color: 'from-emerald-500 to-teal-600 text-white',
      trend: 'Total non-cancelled',
      count: summary.activeReceiptCount
    },
    {
      title: 'Discount Relief',
      value: `₹${summary.totalDiscount.toLocaleString('en-IN')}`,
      icon: 'fa-solid fa-percent',
      color: 'from-indigo-500 to-blue-600 text-white',
      trend: 'Value of price cuts',
      count: 'Active'
    },
    {
      title: 'Loss/Cancelled',
      value: `₹${summary.totalCancelled.toLocaleString('en-IN')}`,
      icon: 'fa-solid fa-circle-xmark',
      color: 'from-rose-500 to-pink-600 text-white',
      trend: 'Cancelled revenue',
      count: summary.cancelledReceiptCount
    },
    {
      title: 'Avg. Transaction',
      value: `₹${(receipts.length ? (summary.totalRevenue / (summary.activeReceiptCount || 1)) : 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      icon: 'fa-solid fa-calculator',
      color: 'from-slate-700 to-slate-800 text-white',
      trend: 'Per active record',
      count: receipts.length
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => (
          <div 
            key={idx} 
            className={`relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br ${card.color} shadow-lg shadow-indigo-100 transition-all hover:-translate-y-1`}
          >
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <span className="p-2 rounded-lg bg-white/20 backdrop-blur-md">
                  <i className={`${card.icon} text-lg text-white`}></i>
                </span>
                <span className="text-[10px] font-black bg-black/10 px-2 py-1 rounded uppercase tracking-tighter">
                  {card.count} Entries
                </span>
              </div>
              <h3 className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">{card.title}</h3>
              <div className="text-2xl font-black text-white mb-2 tracking-tight">{card.value}</div>
              <p className="text-[10px] font-bold text-white/60 uppercase">
                {card.trend}
              </p>
            </div>
            <i className={`${card.icon} absolute -right-4 -bottom-4 text-8xl text-white/5 pointer-events-none`}></i>
          </div>
        ))}
      </div>

      {/* Main Statistics Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Performance Trend (NEW Line Chart) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Financial Performance Trend</h3>
              <p className="text-xs text-slate-500 font-medium">Daily revenue momentum (last 7 active days)</p>
            </div>
          </div>
          
          <div className="h-48 w-full relative group">
            {trendData.length > 1 ? (
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                {/* Grid Lines */}
                <line x1="0" y1="0" x2="100" y2="0" stroke="#f1f5f9" strokeWidth="0.5" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="#f1f5f9" strokeWidth="0.5" />
                <line x1="0" y1="100" x2="100" y2="100" stroke="#f1f5f9" strokeWidth="0.5" />
                
                {/* The Trend Line */}
                <polyline
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={trendData.map((d, i) => {
                    const x = (i / (trendData.length - 1)) * 100;
                    const max = Math.max(...trendData.map(td => td[1])) || 1;
                    const y = 100 - (d[1] / max) * 100;
                    return `${x},${y}`;
                  }).join(' ')}
                />
                {/* Gradient Area */}
                <path
                  className="fill-indigo-50/50"
                  d={`M0,100 ${trendData.map((d, i) => {
                    const x = (i / (trendData.length - 1)) * 100;
                    const max = Math.max(...trendData.map(td => td[1])) || 1;
                    const y = 100 - (d[1] / max) * 100;
                    return `L${x},${y}`;
                  }).join(' ')} L100,100 Z`}
                />
                {/* Data Points */}
                {trendData.map((d, i) => {
                  const x = (i / (trendData.length - 1)) * 100;
                  const max = Math.max(...trendData.map(td => td[1])) || 1;
                  const y = 100 - (d[1] / max) * 100;
                  return (
                    <circle key={i} cx={x} cy={y} r="1.5" className="fill-indigo-600 stroke-white stroke-[0.5]" />
                  );
                })}
              </svg>
            ) : (
              <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-xl">
                <i className="fa-solid fa-chart-line text-slate-200 text-3xl mb-2"></i>
                <p className="text-xs font-bold text-slate-400 uppercase">Insufficient Data for Trend</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-between mt-4">
             {trendData.map((d, i) => (
               <div key={i} className="text-[9px] font-black text-slate-400 uppercase rotate-[-45deg] origin-top-left">
                 {new Date(d[0]).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
               </div>
             ))}
          </div>
        </div>

        {/* Transaction Distribution (Pie-ish) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Entry Distribution</h3>
          <div className="relative w-40 h-40 mb-6">
             <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
               <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3" />
               {statuses.map((status, idx) => {
                  const count = statusCounts[status] || 0;
                  const percent = (count / totalCount) * 100;
                  let prevPercent = 0;
                  for(let i=0; i<idx; i++) {
                    prevPercent += ((statusCounts[statuses[i]] || 0) / totalCount) * 100;
                  }
                  const colors: any = {
                    [ReceiptStatus.PAID]: '#10b981',
                    [ReceiptStatus.PENDING]: '#f59e0b',
                    [ReceiptStatus.CANCELLED]: '#f43f5e',
                    [ReceiptStatus.PARTIAL]: '#3b82f6',
                  };
                  return (
                    <circle 
                      key={status}
                      cx="18" cy="18" r="15.915" 
                      fill="none" 
                      stroke={colors[status]} 
                      strokeWidth="3.5" 
                      strokeDasharray={`${percent} ${100 - percent}`} 
                      strokeDashoffset={-prevPercent}
                    />
                  );
               })}
             </svg>
             <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-black text-slate-900 leading-none">{receipts.length}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Total</span>
             </div>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 w-full">
            {statuses.map(status => (
              <div key={status} className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                <div className={`w-2 h-2 rounded-full ${
                  status === ReceiptStatus.PAID ? 'bg-emerald-500' : 
                  status === ReceiptStatus.PENDING ? 'bg-amber-500' : 
                  status === ReceiptStatus.CANCELLED ? 'bg-rose-500' : 'bg-blue-500'
                }`}></div>
                <span>{status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Breakdown (Bar/Progress) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Revenue Weighted by Status</h3>
          <div className="space-y-4">
            {statuses.map(status => {
              const statusTotal = receipts
                .filter(r => r.status === status)
                .reduce((sum, r) => sum + r.totalAmount, 0);
              const totalRevenue = summary.totalRevenue + summary.totalCancelled || 1;
              const percentage = (statusTotal / totalRevenue) * 100;
              const colors: any = {
                [ReceiptStatus.PAID]: 'bg-emerald-500',
                [ReceiptStatus.PENDING]: 'bg-amber-500',
                [ReceiptStatus.CANCELLED]: 'bg-rose-500',
                [ReceiptStatus.PARTIAL]: 'bg-blue-500',
              };
              return (
                <div key={status} className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-black uppercase">
                    <span className="text-slate-500">{status}</span>
                    <span className="text-slate-900">₹{statusTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                    <div 
                      className={`h-full ${colors[status]} rounded-full transition-all duration-1000`} 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Performing Categories/Items (NEW Statistic Section) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Top Contributing Items</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topItems.length > 0 ? topItems.map(([name, data], idx) => (
              <div key={idx} className="p-4 rounded-xl border border-indigo-50 bg-indigo-50/20 group hover:bg-indigo-600 transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                   <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black group-hover:bg-white group-hover:text-indigo-600">
                     {idx + 1}
                   </div>
                   <h4 className="text-xs font-black text-slate-900 uppercase truncate group-hover:text-white">{name}</h4>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold group-hover:text-indigo-100">
                    <span className="text-slate-400">Total Rev</span>
                    <span className="text-indigo-600 group-hover:text-white">₹{data.revenue.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold group-hover:text-indigo-100">
                    <span className="text-slate-400">Total Qty</span>
                    <span className="text-slate-900 group-hover:text-white">{data.qty} Units</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-3 py-8 flex items-center justify-center text-slate-300 text-xs font-bold uppercase tracking-widest">
                Add entries to see item performance
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

const useMemo = React.useMemo;

export default Dashboard;
