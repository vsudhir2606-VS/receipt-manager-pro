
import React, { useState, useMemo, useEffect } from 'react';
import { Receipt, ReceiptStatus, FinancialSummary } from './types';
import Dashboard from './components/Dashboard';
import ReceiptTable from './components/ReceiptTable';
import ReceiptForm from './components/ReceiptForm';

const App: React.FC = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('rupee_receipts');
    if (saved) {
      try {
        setReceipts(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved receipts", e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('rupee_receipts', JSON.stringify(receipts));
  }, [receipts]);

  const generateReceiptNo = (count: number): string => {
    const nextNum = count + 1;
    return `AB_RNC - ${nextNum.toString().padStart(2, '0')}`;
  };

  const nextReceiptNo = useMemo(() => {
    // We base it on the highest receipt number found or just length if none
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

  const handleAddReceipt = (data: Omit<Receipt, 'id' | 'receiptNo' | 'amount' | 'totalAmount'>) => {
    const amount = data.quantity * data.price;
    const totalAmount = amount - data.discount;
    
    const newReceipt: Receipt = {
      ...data,
      id: crypto.randomUUID(),
      receiptNo: nextReceiptNo,
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
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <i className="fa-solid fa-file-invoice-dollar text-2xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">RupeeReceipts</h1>
              <p className="text-sm text-slate-500">Financial Management Tool</p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingReceipt(null);
              setIsFormOpen(true);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-sm active:scale-95"
          >
            <i className="fa-solid fa-plus"></i>
            New Receipt
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Dashboard Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <i className="fa-solid fa-chart-pie text-indigo-600"></i>
            <h2 className="text-lg font-semibold text-slate-800">Financial Summary</h2>
          </div>
          <Dashboard summary={financialSummary} />
        </section>

        {/* Data Table Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-list-check text-indigo-600"></i>
              <h2 className="text-lg font-semibold text-slate-800">Recent Transactions</h2>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-200 text-slate-600">
              {receipts.length} Records
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

      {/* Form Modal */}
      {isFormOpen && (
        <ReceiptForm 
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={editingReceipt ? handleUpdateReceipt : handleAddReceipt}
          initialData={editingReceipt || undefined}
          nextReceiptNo={editingReceipt ? editingReceipt.receiptNo : nextReceiptNo}
        />
      )}
    </div>
  );
};

export default App;
