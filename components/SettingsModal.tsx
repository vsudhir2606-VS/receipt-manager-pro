
import React, { useRef } from 'react';
import { Receipt } from '../types.ts';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipts: Receipt[];
  onImport: (data: Receipt[]) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, receipts, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadBackup = () => {
    if (receipts.length === 0) {
      alert("Ledger is currently empty. Add data before creating a backup.");
      return;
    }
    const blob = new Blob([JSON.stringify(receipts, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RECEIPT_MANAGER_PRO_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleUploadBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (Array.isArray(data)) {
          if (confirm(`Valid backup detected with ${data.length} records. This will REPLACE your current local ledger. Continue?`)) {
            onImport(data);
            alert("Success: Ledger has been synchronized.");
            onClose();
          }
        } else {
          alert("Error: The selected file does not contain a valid Receipt Manager Pro ledger array.");
        }
      } catch (err) {
        alert("Error: Failed to parse the backup file. Please ensure it is a valid .json file.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClearAll = () => {
    if (confirm("WARNING: This will permanently delete ALL data in your current browser ledger. This action cannot be undone unless you have a backup. Proceed?")) {
      onImport([]);
      alert("Ledger cleared.");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
               <i className="fa-solid fa-gear"></i>
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-tight">Data Management</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Import & Export Portal</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Export Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.15em]">Local Backup</h3>
            <button 
              onClick={handleDownloadBackup}
              className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 hover:bg-indigo-50 group transition-all"
            >
              <div className="flex items-center gap-4 text-left">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <i className="fa-solid fa-download"></i>
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">Download Backup</div>
                  <div className="text-[10px] text-slate-500">Save complete ledger as JSON file</div>
                </div>
              </div>
              <i className="fa-solid fa-chevron-right text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all"></i>
            </button>
          </div>

          {/* Import Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.15em]">Synchronize</h3>
            <input type="file" ref={fileInputRef} onChange={handleUploadBackup} className="hidden" accept=".json" />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-emerald-300 hover:bg-emerald-50 group transition-all"
            >
              <div className="flex items-center gap-4 text-left">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <i className="fa-solid fa-upload"></i>
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">Import Data</div>
                  <div className="text-[10px] text-slate-500">Restore or sync from a backup file</div>
                </div>
              </div>
              <i className="fa-solid fa-chevron-right text-slate-300 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all"></i>
            </button>
          </div>

          <div className="h-px bg-slate-100 my-2"></div>

          {/* Danger Zone */}
          <div className="space-y-3">
             <button 
              onClick={handleClearAll}
              className="w-full py-3 text-rose-500 hover:text-rose-600 font-bold text-xs uppercase tracking-widest hover:bg-rose-50 rounded-xl transition-all"
            >
              <i className="fa-solid fa-trash-can mr-2"></i> Wipe Current Ledger
            </button>
          </div>
        </div>

        <div className="p-6 bg-slate-50 text-center">
           <p className="text-[9px] text-slate-400 font-medium leading-relaxed">
             Receipt Manager Pro stores data locally in your browser. <br/>
             To share your database with other people, download the backup <br/>
             and send it to them for importing.
           </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;