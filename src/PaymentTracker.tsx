import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Download, Share2, Trash2, Plus, Building2, Camera, Landmark, QrCode, RotateCcw } from 'lucide-react';

interface PaymentRow {
  id: number;
  description: string;
  quantity: string | number;
  rate: string | number;
}

const PaymentTracker: React.FC = () => {
  const initialRows = [{ id: 1, description: 'Structural Design Service', quantity: 1000, rate: 5 }];

  const getSaved = (key: string, def: any) => {
    const s = localStorage.getItem(key);
    if (!s) return def;
    try { return JSON.parse(s); } catch { return s; }
  };

  const [logo, setLogo] = useState<string | null>(() => localStorage.getItem('p_logo'));
  const [qrCode, setQrCode] = useState<string | null>(() => localStorage.getItem('p_qr'));
  const [invoiceLabel, setInvoiceLabel] = useState(() => getSaved('p_label', 'INVOICE'));
  const [advanceLabel, setAdvanceLabel] = useState(() => getSaved('p_adv_lbl', 'ADVANCE PAID:'));
  const [snoLabel, setSnoLabel] = useState(() => getSaved('p_sno_lbl', 'S.NO'));
  const [companyName, setCompanyName] = useState(() => getSaved('p_comp', 'UNIQ DESIGNS'));
  const [engineerName, setEngineerName] = useState(() => getSaved('p_eng', 'Structural Engineer : M. Prakash M.E.,'));
  const [address, setAddress] = useState(() => getSaved('p_addr', 'NO: 14/2, 1st Floor, Thambiran street, Trichy - 620005.'));
  const [clientName, setClientName] = useState(() => getSaved('p_client', 'Client Name'));
  const [invoiceNo, setInvoiceNo] = useState(() => getSaved('p_inv_no', 'INV-8156'));
  const [invoiceDate, setInvoiceDate] = useState(() => getSaved('p_date', new Date().toISOString().split('T')[0]));
  const [advanceInput, setAdvanceInput] = useState<string | number>(() => getSaved('p_adv_val', 2000));
  const [rows, setRows] = useState<PaymentRow[]>(() => getSaved('p_rows', initialRows));
  const [bankName, setBankName] = useState(() => getSaved('p_bank', 'INDIAN BANK'));
  const [accName, setAccName] = useState(() => getSaved('p_acc_n', 'PRAKASH M'));
  const [accNo, setAccNo] = useState(() => getSaved('p_acc_no', '6231059572'));

  useEffect(() => {
    const data = {
      p_label: invoiceLabel, p_adv_lbl: advanceLabel, p_sno_lbl: snoLabel, p_comp: companyName,
      p_eng: engineerName, p_addr: address, p_client: clientName, p_inv_no: invoiceNo,
      p_date: invoiceDate, p_adv_val: advanceInput, p_rows: rows, p_bank: bankName,
      p_acc_n: accName, p_acc_no: accNo
    };
    Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, JSON.stringify(v)));
    if (logo) localStorage.setItem('p_logo', logo);
    if (qrCode) localStorage.setItem('p_qr', qrCode);
  }, [logo, qrCode, invoiceLabel, advanceLabel, snoLabel, companyName, engineerName, address, clientName, invoiceNo, invoiceDate, advanceInput, rows, bankName, accName, accNo]);

  const logoRef = useRef<HTMLInputElement>(null);
  const qrRef = useRef<HTMLInputElement>(null);

  const handleReset = () => {
    if (window.confirm("Invoice data-va reset panna ok-va?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    const f = e.target.files?.[0];
    if (f) {
      const r = new FileReader();
      r.onloadend = () => setter(r.result as string);
      r.readAsDataURL(f);
    }
  };

  const handleNumericInput = (val: string) => (val === '' ? '' : parseFloat(val) || '');

  const updateRow = useCallback((id: number, field: keyof PaymentRow, value: string) => {
    setRows(prev => prev.map(row => 
      row.id === id ? { ...row, [field]: (field === 'quantity' || field === 'rate') ? handleNumericInput(value) : value } : row
    ));
  }, []);

  const totalAmount = useMemo(() => rows.reduce((s, r) => s + ((Number(r.quantity) || 0) * (Number(r.rate) || 0)), 0), [rows]);
  const balance = useMemo(() => totalAmount - (Number(advanceInput) || 0), [totalAmount, advanceInput]);

  const onShare = async () => {
    const text = `*Invoice: ${companyName}*\nClient: ${clientName}\nTotal: ₹${totalAmount.toLocaleString()}\nBalance: ₹${balance.toLocaleString()}`;
    if (navigator.share) await navigator.share({ title: 'Invoice', text });
    else window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans print:bg-white flex flex-col items-center">
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body { background: white; -webkit-print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-container { 
            width: 210mm; 
            min-height: 297mm; 
            padding: 10mm; 
            margin: 0; 
            box-shadow: none !important; 
            border: none !important;
            transform: scale(1);
            transform-origin: top left;
          }
        }
        .mobile-fit { max-width: 100vw; padding: 10px; }
        @media (min-width: 768px) { .mobile-fit { max-width: 800px; padding: 20px; } }
      `}</style>

      <div className="w-full mobile-fit bg-white shadow-xl md:rounded-xl border border-gray-200 print-container overflow-hidden my-0 md:my-6">
        
        {/* Header */}
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex-1">
             <div className="w-44 h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded flex flex-col items-center justify-center cursor-pointer no-print mb-3" onClick={() => logoRef.current?.click()}>
               {logo ? <img src={logo} alt="Logo" className="w-full h-full object-contain" /> : <Camera size={24} className="text-gray-300"/>}
               <input type="file" ref={logoRef} hidden accept="image/*" onChange={e => handleImage(e, setLogo)} />
             </div>
             {logo && <img src={logo} className="hidden print:block w-44 h-24 object-contain mb-2" />}
             <input className="block w-full text-xl md:text-2xl font-black outline-none uppercase text-blue-900 leading-tight" value={companyName} onChange={e => setCompanyName(e.target.value)} />
             <input className="block w-full text-[10px] md:text-xs font-bold text-gray-600 outline-none" value={engineerName} onChange={e => setEngineerName(e.target.value)} />
             <input className="block w-full text-[9px] md:text-[10px] text-gray-400 outline-none" value={address} onChange={e => setAddress(e.target.value)} />
          </div>
          <input className="text-2xl md:text-3xl font-black text-gray-800 text-right outline-none uppercase bg-transparent" value={invoiceLabel} onChange={e => setInvoiceLabel(e.target.value)} />
        </div>

        {/* Bill Info Grid */}
        <div className="grid grid-cols-2 border-y-2 border-gray-900 mb-4">
          <div className="p-3 border-r-2 border-gray-900 bg-blue-50/20">
            <p className="text-[10px] font-black text-blue-600 mb-2">BILL TO</p>
            <input className="w-full font-bold text-base outline-none bg-transparent" value={clientName} onChange={e => setClientName(e.target.value)} />
          </div>
          <div className="p-3 flex flex-col justify-center space-y-2">
            <div className="flex justify-between items-center text-[11px]"><span className="text-gray-500 font-bold uppercase tracking-tighter">Invoice No:</span><input className="text-right font-black outline-none w-24 bg-transparent" value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} /></div>
            <div className="flex justify-between items-center text-[11px]"><span className="text-gray-500 font-bold uppercase tracking-tighter">Date:</span><input type="date" className="text-right font-bold outline-none w-32 bg-transparent" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} /></div>
          </div>
        </div>

        {/* Professional Table */}
        <div className="overflow-x-auto mb-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-800 text-white text-[10px] md:text-xs uppercase">
                <th className="py-2.5 border-r border-slate-700 w-12"><input className="bg-transparent text-center w-full outline-none" value={snoLabel} onChange={e => setSnoLabel(e.target.value)} /></th>
                <th className="py-2.5 px-3 border-r border-slate-700 text-left">DESCRIPTION</th>
                <th className="py-2.5 border-r border-slate-700 w-16">QTY</th>
                <th className="py-2.5 border-r border-slate-700 w-20">RATE</th>
                <th className="py-2.5 px-3 text-right w-24">AMOUNT</th>
              </tr>
            </thead>
            <tbody className="text-[10px] md:text-sm">
              {rows.map((row, index) => (
                <tr key={row.id} className="border-b border-gray-100">
                  <td className="py-3 text-center text-gray-300 font-bold border-r">{index + 1}</td>
                  <td className="py-3 px-3 border-r"><input className="w-full font-bold outline-none" value={row.description} onChange={e => updateRow(row.id, 'description', e.target.value)} /></td>
                  <td className="py-3 border-r text-center"><input className="w-full text-center outline-none bg-transparent" value={row.quantity} onChange={e => updateRow(row.id, 'quantity', e.target.value)} /></td>
                  <td className="py-3 border-r text-center"><input className="w-full text-center font-bold text-blue-600 outline-none bg-transparent" value={row.rate} onChange={e => updateRow(row.id, 'rate', e.target.value)} /></td>
                  <td className="py-3 px-3 text-right font-black">₹{((Number(row.quantity) || 0) * (Number(row.rate) || 0)).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => setRows([...rows, {id: Date.now(), description: '', quantity: '', rate: ''}])} className="p-2 text-blue-500 font-bold text-[10px] no-print flex items-center gap-1 hover:bg-blue-50 transition-all"><Plus size={14}/> ADD LINE ITEM</button>
        </div>

        {/* Calculation */}
        <div className="p-4 space-y-3 mb-4">
          <div className="flex justify-between items-center px-2 font-bold"><span className="text-gray-400 uppercase text-[11px]">Total Work Value:</span><span className="text-xl font-black">₹{totalAmount.toLocaleString()}</span></div>
          <div className="flex justify-between items-center px-4 py-2 bg-gray-50 rounded-lg border border-gray-100">
            <input className="text-[10px] font-black text-green-600 bg-transparent outline-none uppercase w-40" value={advanceLabel} onChange={e => setAdvanceLabel(e.target.value)} />
            <div className="flex items-center gap-1 font-black text-green-600 text-lg"><span className="text-xs opacity-50">₹</span><input className="w-24 text-right outline-none bg-transparent" value={advanceInput} onChange={e => setAdvanceInput(handleNumericInput(e.target.value))} /></div>
          </div>
          <div className="flex justify-between items-center bg-slate-900 text-white p-5 rounded-2xl shadow-xl">
            <span className="font-black text-xs uppercase tracking-widest">BALANCE DUE:</span>
            <span className="text-3xl font-black font-mono">₹{balance.toLocaleString()}</span>
          </div>
        </div>

        {/* Footer Realignment (Bank, QR and Note) */}
        <div className="p-4 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="space-y-0.5 min-w-[150px] text-center md:text-left">
              <p className="text-[9px] font-black text-blue-600 uppercase mb-2 tracking-widest flex items-center justify-center md:justify-start gap-1"><Landmark size={12}/> Bank Info</p>
              <input className="block w-full font-black text-xs outline-none bg-transparent text-center md:text-left uppercase" value={bankName} onChange={e => setBankName(e.target.value)} />
              <input className="block w-full text-[11px] font-bold text-gray-600 outline-none bg-transparent text-center md:text-left" value={accName} onChange={e => setAccName(e.target.value)} />
              <input className="block w-full text-[11px] text-gray-500 outline-none font-mono bg-transparent text-center md:text-left" value={accNo} onChange={e => setAccNo(e.target.value)} />
            </div>

            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-gray-50 border border-dashed border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer overflow-hidden no-print" onClick={() => qrRef.current?.click()}>
                {qrCode ? <img src={qrCode} alt="QR" className="w-full h-full object-cover" /> : <><QrCode size={20} className="text-gray-300"/><span className="text-[8px] text-gray-400 uppercase">QR</span></>}
                <input type="file" ref={qrRef} hidden accept="image/*" onChange={e => handleImage(e, setQrCode)} />
              </div>
              {qrCode && <img src={qrCode} alt="QR" className="hidden print:block w-24 h-24 object-contain" />}
              <span className="text-[8px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">Scan to Pay</span>
            </div>
          </div>

          <div className="flex-1 text-[10px] text-center md:text-right italic text-gray-400 leading-relaxed border-t md:border-t-0 pt-4 md:pt-0">
             *Please verify drawings and dimensions before execution. 
             <p className="font-black text-gray-700 uppercase mt-1">Thank you for Choosing {companyName}</p>
          </div>
        </div>

        {/* Mobile Action Buttons */}
        <div className="p-4 bg-gray-100 flex flex-wrap gap-2 no-print pb-10 border-t">
          <button onClick={() => window.print()} className="flex-1 bg-[#1e293b] text-white py-4 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md">
            <Download size={18}/> PRINT PDF
          </button>
          <button onClick={onShare} className="flex-1 bg-[#25D366] text-white py-4 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md">
            <Share2 size={18}/> SHARE
          </button>
          <button onClick={handleReset} className="w-full md:w-auto bg-white text-red-500 py-4 px-6 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 border border-red-100 active:bg-red-50 transition-all">
            <RotateCcw size={16}/> RESET
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentTracker;
