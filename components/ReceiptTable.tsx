
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
      <div className="p-16 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-6">
          <i className="fa-solid fa-file-pen text-3xl text-slate-300"></i>
        </div>
        <h3 className="text-xl font-bold text-slate-900">No entries yet</h3>
        <p className="text-slate-500 max-w-sm mx-auto mt-2">All receipt data must be entered manually. Click "Add New Entry" to get started.</p>
      </div>
    );
  }

  const getStatusStyle = (status: ReceiptStatus) => {
    switch (status) {
      case ReceiptStatus.PAID: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case ReceiptStatus.PENDING: return 'bg-amber-100 text-amber-700 border-amber-200';
      case ReceiptStatus.CANCELLED: return 'bg-rose-100 text-rose-700 border-rose-200';
      case ReceiptStatus.PARTIAL: return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-4 py-4 font-bold text-slate-700 uppercase text-[10px] tracking-widest whitespace-nowrap">Date</th>
            <th className="px-4 py-4 font-bold text-slate-700 uppercase text-[10px] tracking-widest whitespace-nowrap">Receipt No.</th>
            <th className="px-4 py-4 font-bold text-slate-700 uppercase text-[10px] tracking-widest whitespace-nowrap">Name</th>
            <th className="px-4 py-4 font-bold text-slate-700 uppercase text-[10px] tracking-widest whitespace-nowrap">Item Description</th>
            <th className="px-4 py-4 font-bold text-slate-700 uppercase text-[10px] tracking-widest whitespace-nowrap">Customer Request</th>
            <th className="px-4 py-4 font-bold text-slate-700 uppercase text-[10px] tracking-widest whitespace-nowrap text-center">Qty</th>
            <th className="px-4 py-4 font-bold text-slate-700 uppercase text-[10px] tracking-widest whitespace-nowrap text-right">Price</th>
            <th className="px-4 py-4 font-bold text-slate-700 uppercase text-[10px] tracking-widest whitespace-nowrap text-right">Discount</th>
            <th className="px-4 py-4 font-bold text-slate-700 uppercase text-[10px] tracking-widest whitespace-nowrap text-center">Status</th>
            <th className="px-4 py-4 font-bold text-slate-700 uppercase text-[10px] tracking-widest whitespace-nowrap text-right">Total Amount</th>
            <th className="px-4 py-4 font-bold text-slate-700 uppercase text-[10px] tracking-widest whitespace-nowrap text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {receipts.map((receipt) => (
            <tr key={receipt.id} className={`hover:bg-slate-50 transition-colors ${receipt.status === ReceiptStatus.CANCELLED ? 'bg-rose-50/30' : ''}`}>
              <td className="px-4 py-4 whitespace-nowrap text-slate-600 font-medium">{receipt.date}</td>
              <td className="px-4 py-4 whitespace-nowrap font-bold text-indigo-600 font-mono">{receipt.receiptNo}</td>
              <td className="px-4 py-4 whitespace-nowrap font-semibold text-slate-900">{receipt.name}</td>
              <td className="px-4 py-4 max-w-[180px] truncate text-slate-600">{receipt.itemDescription}</td>
              <td className="px-4 py-4 max-w-[150px] truncate text-slate-400 italic">{receipt.customerRequest || '-'}</td>
              <td className="px-4 py-4 whitespace-nowrap text-center font-bold">{receipt.quantity}</td>
              <td className="px-4 py-4 whitespace-nowrap text-right font-medium">₹{receipt.price.toLocaleString('en-IN')}</td>
              <td className="px-4 py-4 whitespace-nowrap text-right text-rose-500 font-bold">-₹{receipt.discount.toLocaleString('en-IN')}</td>
              <td className="px-4 py-4 whitespace-nowrap text-center">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${getStatusStyle(receipt.status)}`}>
                  {receipt.status}
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right font-black text-slate-900">₹{receipt.totalAmount.toLocaleString('en-IN')}</td>
              <td className="px-4 py-4 whitespace-nowrap text-center">
                <div className="flex items-center justify-center gap-1">
                  <button onClick={() => onEdit(receipt)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><i className="fa-solid fa-pen"></i></button>
                  <button onClick={() => onDelete(receipt.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors"><i className="fa-solid fa-trash"></i></button>
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
