import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Download, Share2, Trash2, Plus, Building2, Camera, Landmark, QrCode, RotateCcw } from 'lucide-react';

interface PaymentRow {
  id: number;
  description: string;
  quantity: string | number;
  rate: string | number;
}

const PaymentTracker: React.FC = () => {
  // Initial States for Reset
  const initialRows: PaymentRow[] = [{ id: 1, description: 'Structural Design Service', quantity: 1000, rate: 5 }];

  // Helper to load from LocalStorage
  const getSaved = (key: string, defaultValue: any) => {
    const saved = localStorage.getItem(key);
    if (!saved) return defaultValue;
    try { return JSON.parse(saved); } catch { return saved; }
  };

  // States
  const [logo, setLogo] = useState<string | null>(() => localStorage.getItem('inv_logo'));
  const [qrCode, setQrCode] = useState<string | null>(() => localStorage.getItem('inv_qr'));
  const [invoiceLabel, setInvoiceLabel] = useState(() => getSaved('inv_label', 'INVOICE'));
  const [advanceLabel, setAdvanceLabel] = useState(() => getSaved('inv_advLabel', 'ADVANCE PAID:'));
  const [snoLabel, setSnoLabel] = useState(() => getSaved('inv_snoLabel', 'S.NO'));
  const [companyName, setCompanyName] = useState(() => getSaved('inv_company', 'UNIQ DESIGNS'));
  const [engineerName, setEngineerName] = useState(() => getSaved('inv_engineer', 'Structural Engineer : M. Prakash M.E.,'));
  const [address, setAddress] = useState(() => getSaved('inv_address', 'NO: 14/2, 1st Floor, Thambiran street, Trichy - 620005.'));
  const [clientName, setClientName] = useState(() => getSaved('inv_client', 'Client Name'));
  const [invoiceNo, setInvoiceNo] = useState(() => getSaved('inv_no', 'INV-8156'));
  const [invoiceDate, setInvoiceDate] = useState(() => getSaved('inv_date', new Date().toISOString().split('T')[0]));
  const [advanceInput, setAdvanceInput] = useState<string | number>(() => getSaved('inv_advance', 2000));
  const [rows, setRows] = useState<PaymentRow[]>(() => getSaved('inv_rows', initialRows));
  const [bankName, setBankName] = useState(() => getSaved('inv_bank', 'INDIAN BANK'));
  const [accName, setAccName] = useState(() => getSaved('inv_accName', 'PRAKASH M'));
  const [accNo, setAccNo] = useState(() => getSaved('inv_accNo', '6231059572'));

  // Save to LocalStorage whenever values change
  useEffect(() => {
    const dataMap: Record<string, any> = {
      inv_logo: logo, inv_qr: qrCode, inv_label: invoiceLabel, inv_advLabel: advanceLabel,
      inv_snoLabel: snoLabel, inv_company: companyName, inv_engineer: engineerName,
      inv_address: address, inv_client: clientName, inv_no: invoiceNo, inv_date: invoiceDate,
      inv_advance: advanceInput, inv_rows: rows, inv_bank: bankName, inv_accName: accName, inv_accNo: accNo
    };
    Object.entries(dataMap).forEach(([key, val]) => {
      if (val !== null) localStorage.setItem(key, typeof val === 'object' ? JSON.stringify(val) : val);
    });
  }, [logo, qrCode, invoiceLabel, advanceLabel, snoLabel, companyName, engineerName, address, clientName, invoiceNo, invoiceDate, advanceInput, rows, bankName, accName, accNo]);

  const logoRef = useRef<HTMLInputElement>(null);
  const qrRef = useRef<HTMLInputElement>(null);

  // RESET FUNCTION
  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all data?")) {
      localStorage.clear();
      window.location.reload(); // Quickest way to reset all states to defaults
    }
  };

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

  const onShare = async () => {
    const shareText = `*Invoice from ${companyName}*\nClient: ${clientName}\nTotal: ₹${totalWorkValue.toLocaleString()}\nBalance: ₹${balanceDue.toLocaleString()}`;
    if (navigator.share) {
      await navigator.share({ title: 'Invoice', text: shareText });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans print:bg-white pb-10 overflow-x-hidden">
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 10mm; }
          body { background: white; -webkit-print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-container { border: none !important; box-shadow: none !important; width: 100% !important; max-width: 100% !important; margin: 0 !important; }
        }
      `}</style>

      <div className="max-w-[800px] mx-auto bg-white shadow-xl rounded-xl border border-gray-200 print-container overflow-hidden">
        
        {/* Header Section */}
        <div className="p-6 flex justify-between items-start">
          <div className="flex-1">
             <div className="w-48 h-24 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer overflow-hidden mb-4 no-print" onClick={() => logoRef.current?.click()}>
               {logo ? <img src={logo} alt="Logo" className="w-full h-full object-contain" /> : <><Camera size={24} className="text-gray-400"/><span className="text-[10px] text-gray-400 font-bold uppercase">Logo Upload</span></>}
               <input type="file" ref={logoRef} hidden accept="image/*" onChange={(e) => handleImageUpload(e, setLogo)} />
             </div>
             {logo && <img src={logo} alt="Logo" className="hidden print:block w-48 h-24 object-contain mb-2" />}

             <input className="block w-full text-2xl font-black text-black outline-none uppercase" value={companyName} onChange={e => setCompanyName(e.target.value)} />
             <input className="block w-full text-xs font-bold text-gray-600 outline-none" value={engineerName} onChange={e => setEngineerName(e.target.value)} />
             <input className="block w-full text-[10px] text-gray-400 outline-none" value={address} onChange={e => setAddress(e.target.value)} />
          </div>
          <div className="text-right">
            <input className="text-3xl font-black text-gray-800 text-right outline-none uppercase" value={invoiceLabel} onChange={e => setInvoiceLabel(e.target.value)} />
          </div>
        </div>

        {/* Bill Info Grid */}
        <div className="grid grid-cols-2 border-y-2 border-gray-900">
          <div className="p-4 border-r-2 border-gray-900 bg-blue-50/10">
            <p className="text-[10px] font-black text-blue-600 mb-2 uppercase tracking-widest">BILL TO</p>
            <input className="w-full font-bold text-lg outline-none bg-transparent" value={clientName} onChange={e => setClientName(e.target.value)} />
          </div>
          <div className="p-4">
            <p className="text-[10px] font-black text-blue-600 mb-2 uppercase tracking-widest">INVOICE DETAILS</p>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400 uppercase">No:</span>
              <input className="text-right font-bold outline-none w-24 bg-transparent" value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400 uppercase">Date:</span>
              <input type="date" className="text-right font-bold outline-none no-print bg-transparent" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
              <span className="hidden print:block font-bold">{invoiceDate}</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#1e293b] text-white text-[11px] uppercase tracking-tighter">
              <th className="py-3 px-2 border-r border-slate-700 w-16">
                <input className="bg-transparent text-center w-full outline-none font-black" value={snoLabel} onChange={e => setSnoLabel(e.target.value)} />
              </th>
              <th className="py-3 px-4 border-r border-slate-700 text-left">DESCRIPTION</th>
              <th className="py-3 px-2 border-r border-slate-700 w-20">QTY</th>
              <th className="py-3 px-2 border-r border-slate-700 w-24">RATE</th>
              <th className="py-3 px-4 text-right w-32">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id} className="border-b border-gray-100">
                <td className="py-4 text-center text-gray-300 font-bold border-r border-gray-50">{index + 1}</td>
                <td className="py-4 px-4 border-r border-gray-50">
                  <input className="w-full font-bold text-slate-700 outline-none" value={row.description} onChange={e => updateRow(row.id, 'description', e.target.value)} />
                </td>
                <td className="py-4 border-r border-gray-50 text-center">
                  <input className="w-full text-center outline-none bg-transparent" value={row.quantity} onChange={e => updateRow(row.id, 'quantity', e.target.value)} />
                </td>
                <td className="py-4 border-r border-gray-50 text-center">
                  <input className="w-full text-center font-bold text-blue-600 outline-none bg-transparent" value={row.rate} onChange={e => updateRow(row.id, 'rate', e.target.value)} />
                </td>
                <td className="py-4 px-4 text-right font-black">₹{((Number(row.quantity) || 0) * (Number(row.rate) || 0)).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={() => setRows([...rows, {id: Date.now(), description: '', quantity: '', rate: ''}])} className="p-3 text-blue-500 font-bold text-[10px] flex items-center gap-1 no-print hover:bg-blue-50 transition-all"><Plus size={14}/> ADD LINE ITEM</button>

        {/* Totals Section */}
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center px-4 font-bold">
            <span className="text-gray-400 uppercase text-[11px]">Grand Total:</span>
            <span className="text-2xl font-black">₹{totalWorkValue.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 shadow-inner">
            <input className="text-[11px] font-black text-green-600 bg-transparent outline-none uppercase w-40" value={advanceLabel} onChange={e => setAdvanceLabel(e.target.value)} />
            <div className="flex items-center gap-2 font-black text-green-600 text-lg">
              <span className="text-xs opacity-50">₹</span>
              <input className="w-24 text-right outline-none bg-transparent" value={advanceInput} onChange={e => setAdvanceInput(handleNumericInput(e.target.value))} />
            </div>
          </div>

          <div className="flex justify-between items-center bg-[#0f172a] text-white p-6 rounded-2xl shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-2 opacity-5"><Building2 size={60}/></div>
            <span className="font-black text-xs uppercase tracking-[0.2em] relative z-10">BALANCE DUE:</span>
            <span className="text-3xl font-black relative z-10">₹{balanceDue.toLocaleString()}</span>
          </div>
        </div>

        {/* Footer Section (Bank & Note) */}
        <div className="p-6 border-t border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1 mb-2 tracking-widest"><Landmark size={12}/> Bank Info</p>
            <input className="block font-black text-xs outline-none uppercase" value={bankName} onChange={e => setBankName(e.target.value)} />
            <input className="block text-[11px] font-bold text-gray-600 outline-none" value={accName} onChange={e => setAccName(e.target.value)} />
            <input className="block text-[11px] text-gray-500 outline-none font-mono" value={accNo} onChange={e => setAccNo(e.target.value)} />
          </div>

          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-gray-50 border border-dashed border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer overflow-hidden no-print" onClick={() => qrRef.current?.click()}>
              {qrCode ? <img src={qrCode} alt="QR" className="w-full h-full object-cover" /> : <><QrCode size={20} className="text-gray-300"/><span className="text-[8px] text-gray-400">UPLOAD QR</span></>}
              <input type="file" ref={qrRef} hidden accept="image/*" onChange={(e) => handleImageUpload(e, setQrCode)} />
            </div>
            {qrCode && <img src={qrCode} alt="QR" className="hidden print:block w-24 h-24 object-contain" />}
            <span className="text-[8px] font-bold text-gray-400 mt-1 uppercase">Scan to Pay</span>
          </div>

          <div className="flex-1 md:text-right text-[10px] italic text-gray-400 leading-relaxed">
             *Please verify drawings and dimensions before execution. 
             <p className="font-black text-gray-700 uppercase mt-1">Thank you for Choosing {companyName}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-gray-100 flex flex-wrap gap-3 no-print pb-10 border-t">
          <button onClick={() => window.print()} className="flex-1 bg-[#1e293b] text-white py-4 px-2 rounded-xl font-black text-[11px] uppercase flex items-center justify-center gap-2 active:scale-95 transition-all">
            <Download size={16}/> PRINT PDF
          </button>
          <button onClick={onShare} className="flex-1 bg-[#25D366] text-white py-4 px-2 rounded-xl font-black text-[11px] uppercase flex items-center justify-center gap-2 active:scale-95 transition-all">
            <Share2 size={16}/> SHARE
          </button>
          <button onClick={handleReset} className="w-full md:w-auto bg-red-50 text-red-500 py-4 px-6 rounded-xl font-black text-[11px] uppercase flex items-center justify-center gap-2 active:bg-red-100 transition-all border border-red-100">
            <RotateCcw size={16}/> RESET DATA
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentTracker;
