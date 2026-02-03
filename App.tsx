
import React, { useState, useMemo, useEffect } from 'react';
import { Receipt, ReceiptStatus, FinancialSummary } from './types.ts';
import Dashboard from './components/Dashboard.tsx';
import ReceiptTable from './components/ReceiptTable.tsx';
import ReceiptForm from './components/ReceiptForm.tsx';

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

const App: React.FC = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('rupee_receipts_v2');
    if (saved) {
      try {
        setReceipts(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved receipts", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('rupee_receipts_v2', JSON.stringify(receipts));
  }, [receipts]);

  const nextReceiptNoSuggestion = useMemo(() => {
    if (receipts.length === 0) return "AB_RNC - 01";
    const nums = receipts.map(r => {
      const parts = r.receiptNo.split(' - ');
      return parts.length > 1 ? parseInt(parts[1], 10) : 0;
    });
    const max = Math.max(...nums, 0);
    return `AB_RNC - ${(max + 1).toString().padStart(2, '0')}`;
  }, [receipts]);

  const financialSummary = useMemo((): FinancialSummary => {
    return receipts.reduce(
      (acc, receipt) => {
        if (receipt.status === ReceiptStatus.CANCELLED) {
          acc.totalCancelled += receipt.totalAmount;
          acc.cancelledReceiptCount += 1;
        } else {
          acc.totalRevenue += receipt.totalAmount;
          acc.totalDiscount += receipt.discount;
          acc.activeReceiptCount += 1;
        }
        return acc;
      },
      {
        totalRevenue: 0,
        totalDiscount: 0,
        totalCancelled: 0,
        activeReceiptCount: 0,
        cancelledReceiptCount: 0,
      }
    );
  }, [receipts]);

  const handleAddReceipt = (data: Omit<Receipt, 'id' | 'amount' | 'totalAmount'>) => {
    const amount = data.quantity * data.price;
    const totalAmount = amount - data.discount;
    
    const newReceipt: Receipt = {
      ...data,
      id: generateId(),
      amount,
      totalAmount
    };

    setReceipts([...receipts, newReceipt]);
    setIsFormOpen(false);
  };

  const handleUpdateReceipt = (data: Receipt) => {
    const amount = data.quantity * data.price;
    const totalAmount = amount - data.discount;
    
    const updated = receipts.map(r => 
      r.id === data.id ? { ...data, amount, totalAmount } : r
    );
    
    setReceipts(updated);
    setEditingReceipt(null);
    setIsFormOpen(false);
  };

  const handleDeleteReceipt = (id: string) => {
    if (confirm('Are you sure you want to delete this record?')) {
      setReceipts(receipts.filter(r => r.id !== id));
    }
  };

  const openEditModal = (receipt: Receipt) => {
    setEditingReceipt(receipt);
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen pb-12 bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <i className="fa-solid fa-file-invoice-dollar text-2xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">RupeeReceipts</h1>
              <p className="text-sm text-slate-500 font-medium">Manual Entry Portal</p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingReceipt(null);
              setIsFormOpen(true);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold transition-all shadow-sm active:scale-95"
          >
            <i className="fa-solid fa-plus"></i>
            Add New Entry
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section>
          <div className="flex items-center gap-2 mb-4">
            <i className="fa-solid fa-chart-pie text-indigo-600"></i>
            <h2 className="text-lg font-bold text-slate-800">Financial Insights</h2>
          </div>
          <Dashboard summary={financialSummary} />
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-list-check text-indigo-600"></i>
              <h2 className="text-lg font-bold text-slate-800">Manual Entry Log</h2>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-200 text-slate-600 uppercase">
              {receipts.length} Total Records
            </span>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <ReceiptTable 
              receipts={receipts} 
              onEdit={openEditModal} 
              onDelete={handleDeleteReceipt}
            />
          </div>
        </section>
      </main>

      {isFormOpen && (
        <ReceiptForm 
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={editingReceipt ? handleUpdateReceipt : handleAddReceipt}
          initialData={editingReceipt || undefined}
          nextReceiptNo={nextReceiptNoSuggestion}
        />
      )}
    </div>
  );
};

export default App;
