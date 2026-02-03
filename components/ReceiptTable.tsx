
import React from 'react';
import { Receipt, ReceiptStatus } from '../types';

interface ReceiptTableProps {
  receipts: Receipt[];
  onEdit: (receipt: Receipt) => void;
  onDelete: (id: string) => void;
}

const ReceiptTable: React.FC<ReceiptTableProps> = ({ receipts, onEdit, onDelete }) => {
  if (receipts.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
          <i className="fa-solid fa-folder-open text-2xl text-slate-400"></i>
        </div>
        <h3 className="text-lg font-medium text-slate-900">No records found</h3>
        <p className="text-slate-500 max-w-xs mx-auto mt-1">Start by adding a new receipt using the button above.</p>
      </div>
    );
  }

  const getStatusStyle = (status: ReceiptStatus) => {
    switch (status) {
      case ReceiptStatus.PAID:
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case ReceiptStatus.PENDING:
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case ReceiptStatus.CANCELLED:
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case ReceiptStatus.PARTIAL:
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-4 py-3 font-semibold text-slate-700 uppercase text-[11px] tracking-wider whitespace-nowrap">Date</th>
            <th className="px-4 py-3 font-semibold text-slate-700 uppercase text-[11px] tracking-wider whitespace-nowrap">Receipt No.</th>
            <th className="px-4 py-3 font-semibold text-slate-700 uppercase text-[11px] tracking-wider whitespace-nowrap">Customer Name</th>
            <th className="px-4 py-3 font-semibold text-slate-700 uppercase text-[11px] tracking-wider whitespace-nowrap">Description</th>
            <th className="px-4 py-3 font-semibold text-slate-700 uppercase text-[11px] tracking-wider whitespace-nowrap">Request</th>
            <th className="px-4 py-3 font-semibold text-slate-700 uppercase text-[11px] tracking-wider whitespace-nowrap text-center">Qty</th>
            <th className="px-4 py-3 font-semibold text-slate-700 uppercase text-[11px] tracking-wider whitespace-nowrap text-right">Price</th>
            <th className="px-4 py-3 font-semibold text-slate-700 uppercase text-[11px] tracking-wider whitespace-nowrap text-right">Discount</th>
            <th className="px-4 py-3 font-semibold text-slate-700 uppercase text-[11px] tracking-wider whitespace-nowrap text-right">Total Amount</th>
            <th className="px-4 py-3 font-semibold text-slate-700 uppercase text-[11px] tracking-wider whitespace-nowrap text-center">Status</th>
            <th className="px-4 py-3 font-semibold text-slate-700 uppercase text-[11px] tracking-wider whitespace-nowrap text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {receipts.map((receipt) => (
            <tr key={receipt.id} className={`hover:bg-slate-50 transition-colors ${receipt.status === ReceiptStatus.CANCELLED ? 'opacity-60 grayscale-[0.3]' : ''}`}>
              <td className="px-4 py-4 whitespace-nowrap text-slate-600 font-medium">{receipt.date}</td>
              <td className="px-4 py-4 whitespace-nowrap font-bold text-indigo-600">{receipt.receiptNo}</td>
              <td className="px-4 py-4 whitespace-nowrap font-medium text-slate-900">{receipt.name}</td>
              <td className="px-4 py-4 max-w-[200px] truncate text-slate-600" title={receipt.itemDescription}>
                {receipt.itemDescription}
              </td>
              <td className="px-4 py-4 max-w-[150px] truncate text-slate-500 italic" title={receipt.customerRequest}>
                {receipt.customerRequest || '-'}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-center font-medium">{receipt.quantity}</td>
              <td className="px-4 py-4 whitespace-nowrap text-right text-slate-600">₹{receipt.price.toLocaleString('en-IN')}</td>
              <td className="px-4 py-4 whitespace-nowrap text-right text-rose-500 font-medium">-₹{receipt.discount.toLocaleString('en-IN')}</td>
              <td className="px-4 py-4 whitespace-nowrap text-right font-bold text-slate-900">₹{receipt.totalAmount.toLocaleString('en-IN')}</td>
              <td className="px-4 py-4 whitespace-nowrap text-center">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusStyle(receipt.status)}`}>
                  {receipt.status}
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-center">
                <div className="flex items-center justify-center gap-2">
                  <button 
                    onClick={() => onEdit(receipt)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    title="Edit"
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button 
                    onClick={() => onDelete(receipt.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    title="Delete"
                  >
                    <i className="fa-solid fa-trash"></i>
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
