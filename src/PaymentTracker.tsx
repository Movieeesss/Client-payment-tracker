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
    <div className="min-h-screen bg-slate-100 font-sans print:bg-white flex flex-col items-center">
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body { background: white; -webkit-print-color-adjust: exact; overflow: visible !important; }
          .no-print { display: none !important; }
          .print-container { 
            width: 210mm; 
            min-height: 297mm; 
            padding: 10mm; 
            margin: 0; 
            box-shadow: none !important; 
            border: none !important;
          }
        }
        /* Mobile Scaling Logic */
        .invoice-box { 
          width: 100%; 
          max-width: 800px; 
          background: white; 
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        @media (max-width: 640px) {
          .invoice-box { font-size: 11px; }
          .mobile-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        }
      `}</style>

      <div className="invoice-box print-container md:my-8 md:rounded-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="p-5 md:p-8 flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
             <div className="w-40 h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer no-print mb-4" onClick={() => logoRef.current?.click()}>
               {logo ? <img src={logo} alt="Logo" className="w-full h-full object-contain p-1" /> : <Camera size={20} className="text-slate-300"/>}
               <input type="file" ref={logoRef} hidden accept="image/*" onChange={e => handleImage(e, setLogo)} />
             </div>
             {logo && <img src={logo} className="hidden print:block w-44 h-24 object-contain mb-2" />}
             <input className="block w-full text-xl md:text-3xl font-black outline-none uppercase text-slate-900 truncate" value={companyName} onChange={e => setCompanyName(e.target.value)} />
             <input className="block w-full text-[11px] md:text-sm font-bold text-slate-500 outline-none" value={engineerName} onChange={e => setEngineerName(e.target.value)} />
             <input className="block w-full text-[10px] md:text-xs text-slate-400 outline-none truncate" value={address} onChange={e => setAddress(e.target.value)} />
          </div>
          <input className="text-2xl md:text-4xl font-black text-slate-800 text-right outline-none uppercase bg-transparent w-32 md:w-64" value={invoiceLabel} onChange={e => setInvoiceLabel(e.target.value)} />
        </div>

        {/* Bill Info Grid */}
        <div className="grid grid-cols-2 border-y-2 border-slate-900">
          <div className="p-4 border-r-2 border-slate-900 bg-slate-50/50">
            <p className="text-[10px] font-black text-blue-600 mb-1 tracking-widest">BILL TO</p>
            <input className="w-full font-bold text-base md:text-lg outline-none bg-transparent" value={clientName} onChange={e => setClientName(e.target.value)} />
          </div>
          <div className="p-4 flex flex-col justify-center space-y-2">
            <div className="flex justify-between items-center"><span className="text-slate-400 font-bold uppercase text-[10px]">Invoice No:</span><input className="text-right font-black outline-none w-24 bg-transparent text-sm" value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} /></div>
            <div className="flex justify-between items-center"><span className="text-slate-400 font-bold uppercase text-[10px]">Date:</span><input type="date" className="text-right font-bold outline-none w-32 bg-transparent text-sm" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} /></div>
          </div>
        </div>

        {/* Professional Table */}
        <div className="mobile-table-wrap min-h-[200px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-[11px] uppercase tracking-wider">
                <th className="py-3 border-r border-slate-700 w-12"><input className="bg-transparent text-center w-full outline-none" value={snoLabel} onChange={e => setSnoLabel(e.target.value)} /></th>
                <th className="py-3 px-4 border-r border-slate-700 text-left">DESCRIPTION</th>
                <th className="py-3 border-r border-slate-700 w-16 md:w-20">QTY</th>
                <th className="py-3 border-r border-slate-700 w-20 md:w-24">RATE</th>
                <th className="py-3 px-4 text-right w-24 md:w-32">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id} className="border-b border-slate-100 align-top">
                  <td className="py-4 text-center text-slate-300 font-bold border-r">{index + 1}</td>
                  <td className="py-4 px-4 border-r"><input className="w-full font-bold text-slate-700 outline-none" value={row.description} onChange={e => updateRow(row.id, 'description', e.target.value)} /></td>
                  <td className="py-4 border-r text-center"><input className="w-full text-center outline-none bg-transparent" value={row.quantity} onChange={e => updateRow(row.id, 'quantity', e.target.value)} /></td>
                  <td className="py-4 border-r text-center"><input className="w-full text-center font-bold text-blue-700 outline-none bg-transparent" value={row.rate} onChange={e => updateRow(row.id, 'rate', e.target.value)} /></td>
                  <td className="py-4 px-4 text-right font-black text-slate-900">₹{((Number(row.quantity) || 0) * (Number(row.rate) || 0)).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => setRows([...rows, {id: Date.now(), description: '', quantity: '', rate: ''}])} className="p-3 text-blue-600 font-black text-[10px] no-print flex items-center gap-1 hover:bg-blue-50 transition-all uppercase"><Plus size={14}/> Add New Item</button>
        </div>

        {/* Totals Section */}
        <div className="p-6 space-y-4 bg-slate-50/30">
          <div className="flex justify-between items-center px-2"><span className="text-slate-400 font-black uppercase text-[11px] tracking-widest">Gross Total:</span><span className="text-2xl font-black text-slate-900">₹{totalAmount.toLocaleString()}</span></div>
          <div className="flex justify-between items-center px-4 py-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <input className="text-[11px] font-black text-emerald-600 bg-transparent outline-none uppercase w-40" value={advanceLabel} onChange={e => setAdvanceLabel(e.target.value)} />
            <div className="flex items-center gap-1"><span className="text-emerald-600 text-[11px]">₹</span><input className="w-24 text-right font-black text-emerald-600 bg-transparent outline-none text-xl" value={advanceInput} onChange={e => setAdvanceInput(handleNumericInput(e.target.value))} /></div>
          </div>
          <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-3xl shadow-xl border-t border-slate-700">
            <span className="font-black text-xs uppercase tracking-[0.2em] opacity-60">BALANCE DUE:</span>
            <span className="text-4xl font-black font-mono tracking-tighter">₹{balance.toLocaleString()}</span>
          </div>
        </div>

        {/* Footer (Bank & QR) */}
        <div className="p-6 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-8 w-full md:w-auto text-center md:text-left">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-blue-600 uppercase flex items-center justify-center md:justify-start gap-1 mb-2 tracking-widest"><Landmark size={12}/> Bank Info</p>
              <input className="block w-full font-black text-sm outline-none bg-transparent uppercase" value={bankName} onChange={e => setBankName(e.target.value)} />
              <input className="block w-full text-xs font-bold text-slate-500 outline-none bg-transparent" value={accName} onChange={e => setAccName(e.target.value)} />
              <input className="block w-full text-xs text-slate-400 outline-none font-mono bg-transparent" value={accNo} onChange={e => setAccNo(e.target.value)} />
            </div>

            <div className="flex flex-col items-center">
              <div className="w-28 h-28 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden no-print transition-all hover:border-blue-300" onClick={() => qrRef.current?.click()}>
                {qrCode ? <img src={qrCode} alt="QR" className="w-full h-full object-cover p-1" /> : <><QrCode size={24} className="text-slate-300"/><span className="text-[8px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">QR Upload</span></>}
                <input type="file" ref={qrRef} hidden accept="image/*" onChange={e => handleImage(e, setQrCode)} />
              </div>
              {qrCode && <img src={qrCode} alt="QR" className="hidden print:block w-28 h-28 object-contain" />}
              <span className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Scan to Pay</span>
            </div>
          </div>

          <div className="flex-1 text-[11px] text-center md:text-right italic text-slate-400 leading-relaxed border-t md:border-t-0 pt-6 md:pt-0 w-full">
             *Please verify drawings and dimensions before execution. 
             <p className="font-black text-slate-700 uppercase mt-2 text-xs">THANK YOU FOR CHOOSING {companyName}</p>
          </div>
        </div>

        {/* Mobile Action Buttons */}
        <div className="p-4 bg-slate-50 flex flex-wrap gap-3 no-print pb-12 border-t border-slate-200">
          <button onClick={() => window.print()} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-slate-200">
            <Download size={18}/> PRINT PDF
          </button>
          <button onClick={onShare} className="flex-1 bg-emerald-500 text-white py-4 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-emerald-100">
            <Share2 size={18}/> SHARE
          </button>
          <button onClick={handleReset} className="w-full md:w-auto bg-white text-red-500 py-4 px-8 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 border border-red-100 active:bg-red-50 transition-all shadow-sm">
            <RotateCcw size={18}/> RESET
          </button>
        </div>
      </div>
      
      <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] py-6 no-print">Uniq Designs AI Terminal</p>
    </div>
  );
};

export default PaymentTracker;
