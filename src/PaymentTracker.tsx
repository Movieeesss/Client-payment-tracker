import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Download, Share2, Trash2, Plus, Building2, Camera, Landmark, QrCode, Type } from 'lucide-react';

interface PaymentRow {
  id: number;
  description: string;
  quantity: string | number;
  rate: string | number;
}

const PaymentTracker: React.FC = () => {
  // Image States
  const [logo, setLogo] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  
  // Editable Labels (Neenga ketta control)
  const [invoiceLabel, setInvoiceLabel] = useState('INVOICE');
  const [advanceLabel, setAdvanceLabel] = useState('ADVANCE PAID:');
  const [snoLabel, setSnoLabel] = useState('S.NO');

  // Company & Header Info
  const [companyName, setCompanyName] = useState('UNIQ DESIGNS');
  const [engineerName, setEngineerName] = useState('Structural Engineer : M. Prakash M.E.,');
  const [address, setAddress] = useState('NO: 14/2, 1st Floor, Thambiran street, Trichy - 620005.');
  
  // Client & Invoice Details
  const [clientName, setClientName] = useState('Client Name');
  const [invoiceNo, setInvoiceNo] = useState('INV-8156');
  const [invoiceDate, setInvoiceDate] = useState('2026-04-14');

  // Payment Logic
  const [advanceInput, setAdvanceInput] = useState<string | number>(2000);
  const [rows, setRows] = useState<PaymentRow[]>([
    { id: 1, description: 'Structural Design Service', quantity: 1000, rate: 5 }
  ]);

  // Bank Info
  const [bankName, setBankName] = useState('INDIAN BANK');
  const [accName, setAccName] = useState('PRAKASH M');
  const [accNo, setAccNo] = useState('6231059572');

  const logoRef = useRef<HTMLInputElement>(null);
  const qrRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleNumericInput = (val: string) => (val === '' ? '' : parseFloat(val) || '');

  const updateRow = useCallback((id: number, field: keyof PaymentRow, value: string) => {
    setRows(prev => prev.map(row => 
      row.id === id ? { ...row, [field]: (field === 'quantity' || field === 'rate') ? handleNumericInput(value) : value } : row
    ));
  }, []);

  const totalWorkValue = useMemo(() => 
    rows.reduce((sum, row) => sum + ((Number(row.quantity) || 0) * (Number(row.rate) || 0)), 0)
  , [rows]);

  const balanceDue = useMemo(() => totalWorkValue - (Number(advanceInput) || 0), [totalWorkValue, advanceInput]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-2 md:p-4 print:p-0">
      <style>{`
        @media print {
          @page { size: auto; margin: 0mm; }
          body { background: white; }
          .no-print { display: none !important; }
          .print-container { border: none !important; box-shadow: none !important; width: 100% !important; max-width: 100% !important; margin: 0 !important; }
        }
      `}</style>

      <div className="max-w-[800px] mx-auto bg-white shadow-xl rounded-xl border border-gray-200 print-container overflow-hidden">
        
        {/* Top Header - Rectangular Logo & Editable Invoice Label */}
        <div className="p-6 flex justify-between items-start">
          <div className="flex-1">
             <div 
               className="w-48 h-24 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer overflow-hidden mb-4 no-print"
               onClick={() => logoRef.current?.click()}
             >
               {logo ? <img src={logo} alt="Logo" className="w-full h-full object-contain" /> : <><Camera size={24} className="text-gray-400"/><span className="text-[10px] text-gray-400 font-bold">UPLOAD LOGO</span></>}
               <input type="file" ref={logoRef} hidden accept="image/*" onChange={(e) => handleImageUpload(e, setLogo)} />
             </div>
             {/* Print constant logo if exists */}
             {logo && <img src={logo} alt="Logo" className="hidden print:block w-48 h-24 object-contain mb-4" />}

             <input className="block w-full text-2xl font-black text-black outline-none mb-1" value={companyName} onChange={e => setCompanyName(e.target.value)} />
             <input className="block w-full text-xs font-bold text-gray-600 outline-none" value={engineerName} onChange={e => setEngineerName(e.target.value)} />
             <input className="block w-full text-[10px] text-gray-400 outline-none" value={address} onChange={e => setAddress(e.target.value)} />
          </div>
          <div className="text-right">
            <input 
              className="text-3xl font-black tracking-tighter text-gray-800 text-right outline-none uppercase focus:text-blue-600" 
              value={invoiceLabel} 
              onChange={e => setInvoiceLabel(e.target.value)} 
            />
          </div>
        </div>

        {/* Bill To & Details Section */}
        <div className="grid grid-cols-2 border-y-2 border-gray-800">
          <div className="p-4 border-r-2 border-gray-800">
            <p className="text-[10px] font-black uppercase text-blue-600 mb-2">BILL TO</p>
            <input className="w-full font-bold text-lg text-gray-400 outline-none" value={clientName} onChange={e => setClientName(e.target.value)} />
          </div>
          <div className="p-4">
            <p className="text-[10px] font-black uppercase text-blue-600 mb-2">INVOICE DETAILS</p>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">NO:</span>
              <input className="text-right font-bold outline-none" value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">DATE:</span>
              <input type="text" className="text-right font-bold outline-none" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Professional Table */}
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#1e293b] text-white text-[11px] uppercase">
              <th className="py-3 px-2 border-r border-slate-700 w-16">
                <input className="bg-transparent text-center w-full outline-none" value={snoLabel} onChange={e => setSnoLabel(e.target.value)} />
              </th>
              <th className="py-3 px-4 border-r border-slate-700 text-left">DESCRIPTION</th>
              <th className="py-3 px-2 border-r border-slate-700 w-20">QTY</th>
              <th className="py-3 px-2 border-r border-slate-700 w-24">RATE</th>
              <th className="py-3 px-4 text-right w-32">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id} className="border-b border-gray-100 group">
                <td className="py-4 text-center text-gray-300 font-bold border-r border-gray-50">{index + 1}</td>
                <td className="py-4 px-4 border-r border-gray-50">
                  <input className="w-full font-bold text-slate-700 outline-none" value={row.description} onChange={e => updateRow(row.id, 'description', e.target.value)} />
                </td>
                <td className="py-4 border-r border-gray-50">
                  <input className="w-full text-center outline-none" value={row.quantity} onChange={e => updateRow(row.id, 'quantity', e.target.value)} />
                </td>
                <td className="py-4 border-r border-gray-50">
                  <input className="w-full text-center font-bold text-blue-600 outline-none" value={row.rate} onChange={e => updateRow(row.id, 'rate', e.target.value)} />
                </td>
                <td className="py-4 px-4 text-right font-black">₹{((Number(row.quantity) || 0) * (Number(row.rate) || 0)).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={() => setRows([...rows, {id: Date.now(), description: '', quantity: '', rate: ''}])} className="p-3 text-blue-500 font-bold text-xs flex items-center gap-1 no-print"><Plus size={14}/> ADD ITEM</button>

        {/* Calculation Summary */}
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center px-4">
            <span className="text-gray-400 font-bold">Grand Total:</span>
            <span className="text-2xl font-black">₹{totalWorkValue.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
            <input 
               className="text-[11px] font-black text-green-600 bg-transparent outline-none uppercase w-40" 
               value={advanceLabel} 
               onChange={e => setAdvanceLabel(e.target.value)} 
            />
            <div className="flex items-center gap-2">
              <span className="text-green-600 text-xs">₹</span>
              <input className="w-24 text-right font-black text-green-600 bg-transparent outline-none text-lg" value={advanceInput} onChange={e => setAdvanceInput(handleNumericInput(e.target.value))} />
            </div>
          </div>

          <div className="flex justify-between items-center bg-[#0f172a] text-white p-6 rounded-2xl shadow-lg">
            <span className="font-black tracking-widest text-sm uppercase">BALANCE DUE:</span>
            <span className="text-3xl font-black">₹{balanceDue.toLocaleString()}</span>
          </div>
        </div>

        {/* Bank & QR Section */}
        <div className="p-6 border-t border-gray-100 flex justify-between items-end">
          <div className="space-y-1 flex-1">
            <p className="text-[10px] font-black text-gray-300 uppercase flex items-center gap-1 mb-2"><Landmark size={12}/> BANK INFO</p>
            <input className="block font-black text-sm outline-none" value={bankName} onChange={e => setBankName(e.target.value)} />
            <input className="block text-xs font-bold text-gray-600 outline-none" value={accName} onChange={e => setAccName(e.target.value)} />
            <input className="block text-xs text-gray-500 outline-none" value={accNo} onChange={e => setAccNo(e.target.value)} />
          </div>

          {/* QR Code Upload */}
          <div className="flex flex-col items-center gap-2 mr-10">
            <div 
              className="w-24 h-24 bg-gray-50 border border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer overflow-hidden no-print"
              onClick={() => qrRef.current?.click()}
            >
              {qrCode ? <img src={qrCode} alt="QR" className="w-full h-full object-cover" /> : <QrCode size={20} className="text-gray-300" />}
              <input type="file" ref={qrRef} hidden accept="image/*" onChange={(e) => handleImageUpload(e, setQrCode)} />
            </div>
            {qrCode && <img src={qrCode} alt="QR" className="hidden print:block w-24 h-24 object-cover" />}
            <span className="text-[8px] font-bold text-gray-300 uppercase">SCAN TO PAY</span>
          </div>

          <div className="w-64 text-[10px] text-right italic leading-relaxed text-gray-400">
             *Please verify drawings and dimensions before execution. 
             <p className="font-black text-gray-600 uppercase mt-1">Thank you for Choosing {companyName}</p>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 bg-gray-50 flex gap-4 no-print">
          <button onClick={() => window.print()} className="flex-1 bg-slate-900 text-white py-4 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 active:scale-95 transition-all">
            <Download size={18}/> PRINT PDF
          </button>
        </div>
      </div>
      
      <p className="text-center text-[9px] text-gray-300 mt-4 no-print uppercase tracking-[0.3em]">UNIQ DESIGNS AI INVOICE SYSTEM</p>
    </div>
  );
};

export default PaymentTracker;
