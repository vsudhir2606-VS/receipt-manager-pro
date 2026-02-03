
import React, { useState, useMemo, useEffect } from 'react';
import { Receipt, ReceiptStatus, FinancialSummary } from './types.ts';
import Dashboard from './components/Dashboard.tsx';
import ReceiptTable from './components/ReceiptTable.tsx';
import ReceiptForm from './components/ReceiptForm.tsx';

// External Global declarations for CDN libraries
declare const XLSX: any;
declare const jspdf: any;

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

type View = 'dashboard' | 'ledger';

const App: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('rupee_receipts_v3');
    if (saved) {
      try {
        setReceipts(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved receipts", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('rupee_receipts_v3', JSON.stringify(receipts));
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

  const handleExportExcel = () => {
    if (receipts.length === 0) return alert("No data to export!");
    
    const data = receipts.map(r => ({
      "Date": r.date,
      "Receipt No.": r.receiptNo,
      "Customer Name": r.name,
      "Description": r.itemDescription,
      "Request": r.customerRequest,
      "Qty": r.quantity,
      "Price (₹)": r.price,
      "Discount (₹)": r.discount,
      "Amount (₹)": r.amount,
      "Total Amount (₹)": r.totalAmount,
      "Status": r.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Receipts");
    XLSX.writeFile(workbook, `RupeeReceipts_${new Date().toLocaleDateString()}.xlsx`);
  };

  const handleExportPDF = () => {
    if (receipts.length === 0) return alert("No data to export!");
    
    const doc = new jspdf.jsPDF('landscape');
    doc.setFontSize(18);
    doc.text("RupeeReceipts - Financial Transaction Report", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

    const tableData = receipts.map(r => [
      r.date, r.receiptNo, r.name, r.itemDescription, r.quantity, 
      `Rs. ${r.price}`, `Rs. ${r.discount}`, r.status, `Rs. ${r.totalAmount}`
    ]);

    (doc as any).autoTable({
      head: [['Date', 'No.', 'Name', 'Description', 'Qty', 'Price', 'Discount', 'Status', 'Total']],
      body: tableData,
      startY: 35,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [79, 70, 229] }
    });

    doc.save(`RupeeReceipts_${new Date().toLocaleDateString()}.pdf`);
  };

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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* Header & Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-100">
              <i className="fa-solid fa-indian-rupee-sign text-2xl"></i>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">RupeeReceipts</h1>
              <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-[0.2em] mt-1">Enterprise Portal</p>
            </div>
          </div>

          <nav className="flex items-center bg-slate-100 p-1 rounded-xl gap-1">
            <button 
              onClick={() => setView('dashboard')}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition-all ${view === 'dashboard' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <i className="fa-solid fa-chart-line"></i>
              Dashboard
            </button>
            <button 
              onClick={() => setView('ledger')}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition-all ${view === 'ledger' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <i className="fa-solid fa-database"></i>
              Ledger
            </button>
          </nav>

          <div className="hidden md:block">
             <button
                onClick={() => {
                  setEditingReceipt(null);
                  setIsFormOpen(true);
                }}
                className="flex items-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95"
              >
                <i className="fa-solid fa-plus"></i>
                New Entry
              </button>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {view === 'dashboard' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Financial Overview</h2>
                <p className="text-slate-500 font-medium">Real-time statistics of your manual ledger.</p>
              </div>
              <div className="flex -space-x-2">
                 <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">M</div>
                 <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">A</div>
                 <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-slate-400 font-bold text-xs">+</div>
              </div>
            </div>
            <Dashboard summary={financialSummary} receipts={receipts} />
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Transactional Database</h2>
                <p className="text-slate-500 font-medium">Complete record of all manual entries and calculations.</p>
              </div>
              <div className="flex items-center gap-3">
                 <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    <button 
                      onClick={handleExportExcel}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-lg transition-all font-bold text-xs"
                    >
                      <i className="fa-solid fa-file-excel text-emerald-500"></i>
                      EXCEL
                    </button>
                    <div className="w-px bg-slate-200 mx-1 my-1"></div>
                    <button 
                      onClick={handleExportPDF}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-rose-50 text-slate-600 hover:text-rose-700 rounded-lg transition-all font-bold text-xs"
                    >
                      <i className="fa-solid fa-file-pdf text-rose-500"></i>
                      PDF
                    </button>
                 </div>
                 <button
                    onClick={() => {
                      setEditingReceipt(null);
                      setIsFormOpen(true);
                    }}
                    className="md:hidden flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-xl font-bold text-sm"
                  >
                    <i className="fa-solid fa-plus"></i> Add
                  </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden min-h-[500px]">
              <ReceiptTable 
                receipts={receipts} 
                onEdit={openEditModal} 
                onDelete={handleDeleteReceipt}
              />
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Button (Mobile) */}
      <div className="md:hidden fixed bottom-6 right-6 z-40">
        <button
           onClick={() => {
              setEditingReceipt(null);
              setIsFormOpen(true);
            }}
            className="w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center text-xl active:scale-90 transition-transform"
        >
          <i className="fa-solid fa-plus"></i>
        </button>
      </div>

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
