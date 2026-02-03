
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
        <button 
          onClick={() => (window as any).dispatchEvent(new CustomEvent('open-receipt-form'))}
          className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100"
          style={{ display: 'none' /* Handled by App state, button is just visual anchor */ }}
        >
          Initialize Ledger
        </button>
      </div>
    );
  }

  const getStatusStyle = (status: ReceiptStatus) => {
    switch (status) {
      case ReceiptStatus.PAID: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case ReceiptStatus.PENDING: return 'bg-amber-50 text-amber-700 border-amber-100';
      case ReceiptStatus.CANCELLED: return 'bg-rose-50 text-rose-700 border-rose-100';
      case ReceiptStatus.PARTIAL: return 'bg-blue-50 text-blue-700 border-blue-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-slate-50/50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-5 font-black text-slate-400 uppercase text-[9px] tracking-[0.2em] whitespace-nowrap">Date</th>
            <th className="px-6 py-5 font-black text-slate-400 uppercase text-[9px] tracking-[0.2em] whitespace-nowrap">Receipt No.</th>
            <th className="px-6 py-5 font-black text-slate-400 uppercase text-[9px] tracking-[0.2em] whitespace-nowrap">Name</th>
            <th className="px-6 py-5 font-black text-slate-400 uppercase text-[9px] tracking-[0.2em] whitespace-nowrap">Item Description</th>
            <th className="px-6 py-5 font-black text-slate-400 uppercase text-[9px] tracking-[0.2em] whitespace-nowrap">Customer Request</th>
            <th className="px-6 py-5 font-black text-slate-400 uppercase text-[9px] tracking-[0.2em] whitespace-nowrap text-center">Qty</th>
            <th className="px-6 py-5 font-black text-slate-400 uppercase text-[9px] tracking-[0.2em] whitespace-nowrap text-right">Price</th>
            <th className="px-6 py-5 font-black text-slate-400 uppercase text-[9px] tracking-[0.2em] whitespace-nowrap text-right">Amount</th>
            <th className="px-6 py-5 font-black text-slate-400 uppercase text-[9px] tracking-[0.2em] whitespace-nowrap text-right text-rose-400">Discount</th>
            <th className="px-6 py-5 font-black text-slate-400 uppercase text-[9px] tracking-[0.2em] whitespace-nowrap text-center">AMT/PRD Status</th>
            <th className="px-6 py-5 font-black text-slate-900 uppercase text-[9px] tracking-[0.2em] whitespace-nowrap text-right">Total Amount</th>
            <th className="px-6 py-5 font-black text-slate-400 uppercase text-[9px] tracking-[0.2em] whitespace-nowrap text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {receipts.map((receipt) => (
            <tr key={receipt.id} className={`group hover:bg-slate-50/50 transition-colors ${receipt.status === ReceiptStatus.CANCELLED ? 'bg-rose-50/10' : ''}`}>
              <td className="px-6 py-5 whitespace-nowrap text-slate-500 font-bold tabular-nums">{receipt.date}</td>
              <td className="px-6 py-5 whitespace-nowrap">
                <span className="font-black text-indigo-600 font-mono text-xs px-2 py-1 bg-indigo-50 rounded-md border border-indigo-100">{receipt.receiptNo}</span>
              </td>
              <td className="px-6 py-5 whitespace-nowrap font-extrabold text-slate-900">{receipt.name}</td>
              <td className="px-6 py-5 max-w-[220px] truncate text-slate-600 font-medium">{receipt.itemDescription}</td>
              <td className="px-6 py-5 max-w-[180px] truncate text-slate-400 italic font-medium">{receipt.customerRequest || '-'}</td>
              <td className="px-6 py-5 whitespace-nowrap text-center font-black tabular-nums">{receipt.quantity}</td>
              <td className="px-6 py-5 whitespace-nowrap text-right font-bold tabular-nums text-slate-600">₹{receipt.price.toLocaleString('en-IN')}</td>
              <td className="px-6 py-5 whitespace-nowrap text-right font-bold tabular-nums text-slate-400">₹{(receipt.quantity * receipt.price).toLocaleString('en-IN')}</td>
              <td className="px-6 py-5 whitespace-nowrap text-right text-rose-500 font-black tabular-nums">-₹{receipt.discount.toLocaleString('en-IN')}</td>
              <td className="px-6 py-5 whitespace-nowrap text-center">
                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border shadow-sm ${getStatusStyle(receipt.status)}`}>
                  {receipt.status}
                </span>
              </td>
              <td className="px-6 py-5 whitespace-nowrap text-right font-black text-slate-900 tabular-nums text-base">₹{receipt.totalAmount.toLocaleString('en-IN')}</td>
              <td className="px-6 py-5 whitespace-nowrap text-center">
                <div className="flex items-center justify-center gap-1">
                  <button onClick={() => onEdit(receipt)} className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"><i className="fa-solid fa-pen-to-square"></i></button>
                  <button onClick={() => onDelete(receipt.id)} className="p-2 text-slate-300 hover:text-rose-600 hover:bg-white rounded-lg transition-all"><i className="fa-solid fa-trash-can"></i></button>
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
