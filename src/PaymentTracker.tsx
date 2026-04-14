import React, { useState, useMemo, useCallback } from 'react';
import { Download, Share2, Trash2, Plus, ReceiptIndianRupee, Building2, User } from 'lucide-react';

interface PaymentRow {
  id: number;
  description: string;
  quantity: string | number;
  rate: string | number;
}

const PaymentTracker: React.FC = () => {
  const [companyName, setCompanyName] = useState('UNIQ DESIGNS');
  const [clientName, setClientName] = useState('Client Name / Project');
  const [advanceInput, setAdvanceInput] = useState<string | number>(2000);
  const [rows, setRows] = useState<PaymentRow[]>([
    { id: 1, description: 'Structural Design Work', quantity: 1, rate: 5000 }
  ]);

  // Handle Input Changes without 0 backspace bug
  const handleNumericInput = (val: string) => {
    if (val === '') return '';
    const parsed = parseFloat(val);
    return isNaN(parsed) ? '' : parsed;
  };

  const addRow = useCallback(() => {
    setRows(prev => [...prev, { id: Date.now(), description: '', quantity: '', rate: '' }]);
  }, []);

  const updateRow = useCallback((id: number, field: keyof PaymentRow, value: string) => {
    setRows(prev => prev.map(row => {
      if (row.id === id) {
        if (field === 'quantity' || field === 'rate') {
          return { ...row, [field]: handleNumericInput(value) };
        }
        return { ...row, [field]: value };
      }
      return row;
    }));
  }, []);

  const deleteRow = useCallback((id: number) => {
    setRows(prev => (prev.length > 1 ? prev.filter(row => row.id !== id) : prev));
  }, []);

  // Memoized Calculations for Smoothness
  const totalWorkValue = useMemo(() => {
    return rows.reduce((sum, row) => {
      const q = typeof row.quantity === 'number' ? row.quantity : 0;
      const r = typeof row.rate === 'number' ? row.rate : 0;
      return sum + (q * r);
    }, 0);
  }, [rows]);

  const advanceAmount = useMemo(() => {
    return typeof advanceInput === 'number' ? advanceInput : 0;
  }, [advanceInput]);

  const balanceDue = useMemo(() => totalWorkValue - advanceAmount, [totalWorkValue, advanceAmount]);

  const handleWhatsAppShare = () => {
    const text = `*Invoice: ${companyName}*\nClient: ${clientName}\nTotal: ₹${totalWorkValue.toLocaleString()}\nPaid: ₹${advanceAmount.toLocaleString()}\n*Balance: ₹${balanceDue.toLocaleString()}*`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased pb-10">
      <div className="max-w-md mx-auto bg-white min-h-screen md:min-h-fit md:mt-10 md:shadow-2xl md:rounded-3xl overflow-hidden border-x border-slate-200">
        
        {/* Header Section */}
        <div className="bg-gradient-to-br from-blue-800 to-indigo-950 p-6 text-white pt-10">
          <div className="flex items-center gap-3">
            <Building2 size={24} className="text-blue-300" />
            <input 
              className="bg-transparent border-b border-white/20 text-xl font-black uppercase outline-none focus:border-white w-full transition-all"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          <p className="text-blue-200 text-[10px] tracking-widest font-bold uppercase mt-2 ml-9">Structural Consultancy & Design</p>
        </div>

        <div className="p-4 space-y-6">
          {/* Client Info Card */}
          <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-center justify-between">
            <div className="w-full">
              <label className="flex items-center gap-1 text-[9px] font-black text-blue-400 uppercase mb-1">
                <User size={10} /> Billed To
              </label>
              <input 
                className="w-full bg-transparent text-slate-800 font-bold outline-none text-lg"
                value={clientName}
                placeholder="Client Name..."
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
          </div>

          {/* Work Description List */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Work Details</h3>
              <button onClick={addRow} className="text-blue-600 flex items-center gap-1 text-[10px] font-bold bg-blue-50 px-3 py-1 rounded-full active:scale-95 transition-all">
                <Plus size={12} /> ADD ITEM
              </button>
            </div>

            {rows.map((row, index) => (
              <div key={row.id} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-3 relative group">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-slate-300">#{index + 1}</span>
                  {rows.length > 1 && (
                    <button onClick={() => deleteRow(row.id)} className="text-red-400 p-1 active:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                
                <input 
                  className="w-full font-bold text-slate-700 outline-none border-b border-transparent focus:border-blue-200 py-1 transition-all"
                  placeholder="Enter work description..."
                  value={row.description}
                  onChange={(e) => updateRow(row.id, 'description', e.target.value)}
                />

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1 text-center">Qty</label>
                    <input 
                      type="number"
                      className="w-full bg-slate-100 rounded-xl p-2 font-bold text-center text-sm outline-none focus:ring-2 ring-blue-500/20 transition-all"
                      value={row.quantity}
                      onChange={(e) => updateRow(row.id, 'quantity', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1 text-center">Rate</label>
                    <input 
                      type="number"
                      className="w-full bg-slate-100 rounded-xl p-2 font-bold text-center text-sm text-blue-700 outline-none focus:ring-2 ring-blue-500/20 transition-all"
                      value={row.rate}
                      onChange={(e) => updateRow(row.id, 'rate', e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col justify-center items-end">
                    <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Amount</label>
                    <span className="font-black text-slate-900">₹{((Number(row.quantity) || 0) * (Number(row.rate) || 0)).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals Section */}
          <div className="bg-slate-900 rounded-[2rem] p-6 text-white space-y-5 shadow-2xl">
            <div className="flex justify-between items-center text-xs font-medium opacity-60">
              <span>Gross Estimate Value</span>
              <span className="font-bold">₹{totalWorkValue.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center border-t border-white/10 pt-4">
              <span className="text-xs font-bold text-green-400 uppercase">Advance Paid</span>
              <div className="flex items-center bg-white/10 px-4 py-2 rounded-2xl">
                <span className="text-xs mr-2 opacity-50">₹</span>
                <input 
                  type="number"
                  className="bg-transparent font-black text-right outline-none w-24 text-green-400 text-lg"
                  value={advanceInput}
                  onChange={(e) => setAdvanceInput(handleNumericInput(e.target.value))}
                />
              </div>
            </div>

            <div className={`p-5 rounded-3xl flex justify-between items-center transition-all ${balanceDue > 0 ? 'bg-orange-500/10 border border-orange-500/30' : 'bg-green-600 shadow-lg shadow-green-600/20'}`}>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">
                  {balanceDue > 0 ? 'Balance Due' : 'Status'}
                </p>
                <h2 className="text-3xl font-black">
                  {balanceDue > 0 ? `₹${balanceDue.toLocaleString()}` : 'FULLY PAID'}
                </h2>
              </div>
              <ReceiptIndianRupee size={40} className="opacity-20" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 pb-10">
            <button onClick={() => window.print()} className="flex items-center justify-center gap-2 bg-slate-200 text-slate-800 py-4 rounded-2xl font-black text-[11px] uppercase active:scale-95 transition-all">
              <Download size={18} /> Download PDF
            </button>
            <button onClick={handleWhatsAppShare} className="flex items-center justify-center gap-2 bg-green-500 text-white py-4 rounded-2xl font-black text-[11px] uppercase shadow-lg shadow-green-500/30 active:scale-95 transition-all">
              <Share2 size={18} /> Share Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentTracker;
