
import React, { useState, useEffect } from 'react';
import { Receipt, ReceiptStatus } from '../types';

interface ReceiptFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: Receipt;
  nextReceiptNo: string;
}

const ReceiptForm: React.FC<ReceiptFormProps> = ({ isOpen, onClose, onSubmit, initialData, nextReceiptNo }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    receiptNo: '',
    name: '',
    itemDescription: '',
    customerRequest: '',
    quantity: 1,
    price: 0,
    discount: 0,
    status: ReceiptStatus.PENDING
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        date: initialData.date,
        receiptNo: initialData.receiptNo,
        name: initialData.name,
        itemDescription: initialData.itemDescription,
        customerRequest: initialData.customerRequest,
        quantity: initialData.quantity,
        price: initialData.price,
        discount: initialData.discount,
        status: initialData.status
      });
    } else {
      // Suggest the next number but allow manual overwrite
      setFormData(prev => ({ ...prev, receiptNo: nextReceiptNo }));
    }
  }, [initialData, nextReceiptNo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialData) {
      onSubmit({ ...initialData, ...formData });
    } else {
      onSubmit(formData);
    }
  };

  const amount = formData.quantity * formData.price;
  const totalAmount = amount - formData.discount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {initialData ? 'Edit Record' : 'New Transaction'}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Update details manually below
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Row 1 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Date</label>
              <input
                required
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Receipt No.</label>
              <input
                required
                type="text"
                placeholder="e.g. AB_RNC - 01"
                value={formData.receiptNo}
                onChange={(e) => setFormData({ ...formData, receiptNo: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono font-bold text-indigo-600"
              />
            </div>

            {/* Row 2 */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Customer Name</label>
              <input
                required
                type="text"
                placeholder="Enter client name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Row 3 - Full Width */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Item Description</label>
              <textarea
                required
                rows={2}
                placeholder="What are they buying?"
                value={formData.itemDescription}
                onChange={(e) => setFormData({ ...formData, itemDescription: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
              />
            </div>

            {/* Row 4 - Full Width */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Customer Request (Optional)</label>
              <input
                type="text"
                placeholder="Special instructions..."
                value={formData.customerRequest}
                onChange={(e) => setFormData({ ...formData, customerRequest: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Row 5 - Calculations */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Quantity</label>
              <input
                required
                min="1"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Price per Item (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input
                  required
                  min="0"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-8 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Discount (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400 font-bold">₹</span>
                <input
                  min="0"
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-8 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ReceiptStatus })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
              >
                {Object.values(ReceiptStatus).map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Calculations Review Section */}
          <div className="mt-8 p-5 bg-indigo-50 rounded-xl border border-indigo-100 flex flex-col gap-3">
             <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 font-medium">Subtotal (Qty x Price)</span>
                <span className="font-bold text-slate-900">₹{amount.toLocaleString('en-IN')}</span>
             </div>
             <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 font-medium">Applied Discount</span>
                <span className="font-bold text-rose-500">-₹{formData.discount.toLocaleString('en-IN')}</span>
             </div>
             <div className="h-px bg-indigo-200 my-1"></div>
             <div className="flex justify-between items-center">
                <span className="text-indigo-900 font-bold text-lg">Total Amount</span>
                <span className="text-indigo-600 font-black text-2xl tracking-tight">₹{totalAmount.toLocaleString('en-IN')}</span>
             </div>
          </div>

          {/* Form Footer Actions */}
          <div className="flex gap-3 pt-2 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
            >
              {initialData ? 'Save Changes' : 'Create Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReceiptForm;
