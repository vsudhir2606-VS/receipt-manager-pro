
import React from 'react';
import { Receipt, ReceiptStatus } from '../types.ts';

interface ReceiptTableProps {
  receipts: Receipt[];
  onEdit: (receipt: Receipt) => void;
  onDelete: (id: string) => void;
}

const ReceiptTable: React.FC<ReceiptTableProps> = ({ receipts, onEdit, onDelete }) => {
  if (receipts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center border-4 border-white shadow-lg mb-8">
           <i className="fa-solid fa-database text-4xl text-slate-200"></i>
        </div>
        <h3 className="text-xl font-black text-slate-900">Database Empty</h3>
        <p className="text-slate-500 max-w-sm mx-auto mt-2 font-medium">
          Start building your financial records. Every transaction must be entered manually for precision.
        </p>
      </div>
    );
  }

  const getStatusStyle = (status: ReceiptStatus) => {
    switch (status) {
      case ReceiptStatus.PAID: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case ReceiptStatus.COMPLETED: return 'bg-teal-50 text-teal-700 border-teal-100';
      case ReceiptStatus.PENDING: return 'bg-amber-50 text-amber-700 border-amber-100';
      case ReceiptStatus.CANCELLED: return 'bg-rose-50 text-rose-700 border-rose-100';
      case ReceiptStatus.WORK_IN_PROGRESS: return 'bg-blue-50 text-blue-700 border-blue-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-sm text-left border-collapse table-auto">
        <thead className="bg-slate-50/80 border-b border-slate-200 sticky top-0 z-10 backdrop-blur-sm">
          <tr>
            <th className="px-5 py-6 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] whitespace-nowrap">Date</th>
            <th className="px-5 py-6 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] whitespace-nowrap">Receipt No.</th>
            <th className="px-5 py-6 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] whitespace-nowrap">Name</th>
            <th className="px-5 py-6 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] whitespace-nowrap">Item Description</th>
            <th className="px-5 py-6 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] whitespace-nowrap">Customer Request</th>
            <th className="px-5 py-6 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] whitespace-nowrap text-center">Qty</th>
            <th className="px-5 py-6 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] whitespace-nowrap text-right">Price</th>
            <th className="px-5 py-6 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] whitespace-nowrap text-right">Amount</th>
            <th className="px-5 py-6 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] whitespace-nowrap text-right text-rose-400">Discount</th>
            <th className="px-5 py-6 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] whitespace-nowrap text-center">Status</th>
            <th className="px-5 py-6 font-black text-slate-900 uppercase text-[10px] tracking-[0.2em] whitespace-nowrap text-right">Total Amount</th>
            <th className="px-5 py-6 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] whitespace-nowrap text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {receipts.map((receipt) => (
            <tr key={receipt.id} className={`group hover:bg-slate-50/80 transition-all duration-150 ${receipt.status === ReceiptStatus.CANCELLED ? 'bg-rose-50/20' : ''}`}>
              <td className="px-5 py-5 whitespace-nowrap text-slate-500 font-bold tabular-nums">{receipt.date}</td>
              <td className="px-5 py-5 whitespace-nowrap">
                <span className="font-black text-indigo-600 font-mono text-xs px-2.5 py-1.5 bg-indigo-50/50 rounded-lg border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">{receipt.receiptNo}</span>
              </td>
              <td className="px-5 py-5 whitespace-nowrap font-extrabold text-slate-900">{receipt.name}</td>
              <td className="px-5 py-5 min-w-[200px] text-slate-600 font-medium leading-relaxed">{receipt.itemDescription}</td>
              <td className="px-5 py-5 min-w-[150px] text-slate-400 italic font-medium leading-relaxed">{receipt.customerRequest || '-'}</td>
              <td className="px-5 py-5 whitespace-nowrap text-center font-black tabular-nums">{receipt.quantity}</td>
              <td className="px-5 py-5 whitespace-nowrap text-right font-bold tabular-nums text-slate-600">₹{receipt.price.toLocaleString('en-IN')}</td>
              <td className="px-5 py-5 whitespace-nowrap text-right font-bold tabular-nums text-slate-400">₹{(receipt.quantity * receipt.price).toLocaleString('en-IN')}</td>
              <td className="px-5 py-5 whitespace-nowrap text-right text-rose-500 font-black tabular-nums">-₹{receipt.discount.toLocaleString('en-IN')}</td>
              <td className="px-5 py-5 whitespace-nowrap text-center">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border shadow-sm ${getStatusStyle(receipt.status)}`}>
                  {receipt.status}
                </span>
              </td>
              <td className="px-5 py-5 whitespace-nowrap text-right font-black text-slate-900 tabular-nums text-lg">₹{receipt.totalAmount.toLocaleString('en-IN')}</td>
              <td className="px-5 py-5 whitespace-nowrap text-center">
                <div className="flex items-center justify-center gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => onEdit(receipt)} 
                    className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-slate-200 transition-all"
                    title="Edit Entry"
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button 
                    onClick={() => onDelete(receipt.id)} 
                    className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-slate-200 transition-all"
                    title="Delete Entry"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReceiptTable;