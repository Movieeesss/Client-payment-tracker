import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Download, Share2, Trash2, Plus, Camera, Landmark, QrCode, RotateCcw } from 'lucide-react';

interface PaymentRow {
  id: number;
  description: string;
  quantity: string | number;
  rate: string | number;
}

const PaymentTracker: React.FC = () => {
  const initialRows = [{ id: 1, description: 'Structural Design Service', quantity: 1000, rate: 5 }];

  const getSaved = (key: string, def: any) => {
    if (typeof window === 'undefined') return def;
    const s = localStorage.getItem(key);
    if (!s) return def;
    try { return JSON.parse(s); } catch { return s; }
  };

  const [logo, setLogo] = useState<string | null>(() => getSaved('p_logo', null));
  const [qrCode, setQrCode] = useState<string | null>(() => getSaved('p_qr', null));
  const [invoiceLabel, setInvoiceLabel] = useState(() => getSaved('p_label', 'INVOICE'));
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
    localStorage.setItem('p_logo', logo || '');
    localStorage.setItem('p_qr', qrCode || '');
    localStorage.setItem('p_label', JSON.stringify(invoiceLabel));
    localStorage.setItem('p_comp', JSON.stringify(companyName));
    localStorage.setItem('p_eng', JSON.stringify(engineerName));
    localStorage.setItem('p_addr', JSON.stringify(address));
    localStorage.setItem('p_client', JSON.stringify(clientName));
    localStorage.setItem('p_inv_no', JSON.stringify(invoiceNo));
    localStorage.setItem('p_date', JSON.stringify(invoiceDate));
    localStorage.setItem('p_adv_val', JSON.stringify(advanceInput));
    localStorage.setItem('p_rows', JSON.stringify(rows));
    localStorage.setItem('p_bank', JSON.stringify(bankName));
    localStorage.setItem('p_acc_n', JSON.stringify(accName));
    localStorage.setItem('p_acc_no', JSON.stringify(accNo));
  }, [logo, qrCode, invoiceLabel, companyName, engineerName, address, clientName, invoiceNo, invoiceDate, advanceInput, rows, bankName, accName, accNo]);

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

  const totalAmount = useMemo(() => rows.reduce((s, r) => s + ((Number(r.quantity) || 0) * (Number(r.rate) || 0)), 0), [rows]);
  const balance = totalAmount - (Number(advanceInput) || 0);

  const onShare = async () => {
    const text = `*Invoice: ${companyName}*\nTotal: ₹${totalAmount.toLocaleString()}\nBalance: ₹${balance.toLocaleString()}`;
    if (navigator.share) await navigator.share({ title: 'Invoice', text });
    else window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center print:bg-white overflow-x-hidden">
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body { background: white; -webkit-print-color-adjust: exact; margin: 0; padding: 0; }
          .no-print { display: none !important; }
          .print-container { 
            width: 210mm !important; 
            min-height: 297mm !important; 
            padding: 8mm !important; 
            margin: 0 !important; 
            box-shadow: none !important;
            border: none !important;
            transform: scale(0.98);
            transform-origin: top center;
          }
        }
        /* Any Mobile Resolution Fix */
        .responsive-box { width: 100%; max-width: 800px; }
        @media (max-width: 640px) {
          .responsive-box { font-size: 11px; }
          .mobile-input { font-size: 12px !important; }
          .table-wrapper { overflow-x: auto; }
        }
      `}</style>

      <div className="responsive-box print-container bg-white shadow-xl md:my-8 md:rounded-xl border border-slate-200 overflow-hidden">
        
        {/* Header Section */}
        <div className="p-4 md:p-8 flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
             <div className="w-36 h-20 md:w-44 md:h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer no-print mb-4 hover:border-blue-400" onClick={() => logoRef.current?.click()}>
               {logo ? <img src={logo} alt="Logo" className="w-full h-full object-contain p-1" /> : <Camera size={20} className="text-slate-300"/>}
               <input type="file" ref={logoRef} hidden accept="image/*" onChange={e => handleImage(e, setLogo)} />
             </div>
             {logo && <img src={logo} className="hidden print:block w-40 h-24 object-contain mb-2" />}
             <input className="block w-full text-lg md:text-2xl font-black outline-none uppercase text-slate-900 bg-transparent" value={companyName} onChange={e => setCompanyName(e.target.value)} />
             <input className="block w-full text-[10px] md:text-xs font-bold text-slate-500 outline-none bg-transparent" value={engineerName} onChange={e => setEngineerName(e.target.value)} />
             <input className="block w-full text-[9px] md:text-xs text-slate-400 outline-none truncate bg-transparent" value={address} onChange={e => setAddress(e.target.value)} />
          </div>
          <input className="text-xl md:text-3xl font-black text-slate-800 text-right outline-none uppercase bg-transparent w-24 md:w-64" value={invoiceLabel} onChange={e => setInvoiceLabel(e.target.value)} />
        </div>

        {/* Bill Info Grid */}
        <div className="grid grid-cols-2 border-y-2 border-slate-900">
          <div className="p-3 md:p-4 border-r-2 border-slate-900 bg-slate-50/50">
            <p className="text-[9px] font-black text-blue-600 mb-1 tracking-widest uppercase">BILL TO</p>
            <input className="w-full font-bold text-sm md:text-lg outline-none bg-transparent mobile-input" value={clientName} onChange={e => setClientName(e.target.value)} />
          </div>
          <div className="p-3 md:p-4 flex flex-col justify-center space-y-1">
            <div className="flex justify-between items-center text-[10px] md:text-xs">
              <span className="text-slate-400 font-bold uppercase">No:</span>
              <input className="text-right font-black outline-none w-20 bg-transparent" value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} />
            </div>
            <div className="flex justify-between items-center text-[10px] md:text-xs">
              <span className="text-slate-400 font-bold uppercase">Date:</span>
              <input type="date" className="text-right font-bold outline-none w-32 bg-transparent" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Professional Table */}
        <div className="table-wrapper">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-[10px] md:text-xs uppercase tracking-wider">
                <th className="py-2 border-r border-slate-700 w-10">S.NO</th>
                <th className="py-2 px-3 border-r border-slate-700 text-left">DESCRIPTION</th>
                <th className="py-2 border-r border-slate-700 w-16 text-center">QTY</th>
                <th className="py-2 border-r border-slate-700 w-20 text-center">RATE</th>
                <th className="py-2 px-3 text-right w-24">AMOUNT</th>
              </tr>
            </thead>
            <tbody className="text-[10px] md:text-sm">
              {rows.map((row, index) => (
                <tr key={row.id} className="border-b border-slate-100">
                  <td className="py-3 text-center text-slate-300 font-bold border-r">{index + 1}</td>
                  <td className="py-3 px-3 border-r"><input className="w-full font-bold text-slate-700 outline-none bg-transparent" value={row.description} onChange={e => updateRow(row.id, 'description', e.target.value)} /></td>
                  <td className="py-3 border-r text-center"><input className="w-full text-center outline-none bg-transparent" value={row.quantity} onChange={e => updateRow(row.id, 'quantity', e.target.value)} /></td>
                  <td className="py-3 border-r text-center"><input className="w-full text-center font-bold text-blue-700 outline-none bg-transparent" value={row.rate} onChange={e => updateRow(row.id, 'rate', e.target.value)} /></td>
                  <td className="py-3 px-3 text-right font-black">₹{((Number(row.quantity) || 0) * (Number(row.rate) || 0)).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => setRows([...rows, {id: Date.now(), description: '', quantity: '', rate: ''}])} className="p-3 text-blue-600 font-black text-[10px] no-print flex items-center gap-1 uppercase hover:bg-blue-50 transition-all"><Plus size={14}/> Add New Item</button>
        </div>

        {/* Totals Section */}
        <div className="p-4 md:p-6 space-y-4 bg-slate-50/20">
          <div className="flex justify-between items-center px-2"><span className="text-slate-400 font-black uppercase text-[10px]">Grand Total:</span><span className="text-lg md:text-2xl font-black">₹{totalAmount.toLocaleString()}</span></div>
          <div className="flex justify-between items-center px-4 py-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-black text-emerald-600 uppercase">ADVANCE PAID:</span>
            <div className="flex items-center gap-1"><span className="text-emerald-600 text-[10px]">₹</span><input className="w-24 text-right font-black text-emerald-600 bg-transparent outline-none text-xl" value={advanceInput} onChange={e => setAdvanceInput(e.target.value)} /></div>
          </div>
          <div className="flex justify-between items-center bg-slate-900 text-white p-5 md:p-6 rounded-3xl shadow-xl">
            <span className="font-black text-xs uppercase tracking-widest opacity-60">BALANCE DUE:</span>
            <span className="text-2xl md:text-4xl font-black font-mono">₹{balance.toLocaleString()}</span>
          </div>
        </div>

        {/* Footer Section */}
        <div className="p-4 md:p-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-blue-600 uppercase mb-2 flex items-center justify-center md:justify-start gap-1 tracking-widest"><Landmark size={12}/> Bank Info</p>
              <input className="block w-full font-black text-xs outline-none bg-transparent uppercase" value={bankName} onChange={e => setBankName(e.target.value)} />
              <input className="block w-full text-[11px] font-bold text-slate-500 outline-none bg-transparent" value={accName} onChange={e => setAccName(e.target.value)} />
              <input className="block w-full text-[11px] text-slate-400 outline-none font-mono bg-transparent" value={accNo} onChange={e => setAccNo(e.target.value)} />
            </div>
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden no-print" onClick={() => qrRef.current?.click()}>
                {qrCode ? <img src={qrCode} alt="QR" className="w-full h-full object-cover p-1" /> : <><QrCode size={20} className="text-slate-300"/><span className="text-[8px] text-slate-400 uppercase">QR</span></>}
                <input type="file" ref={qrRef} hidden accept="image/*" onChange={e => handleImage(e, setQrCode)} />
              </div>
              {qrCode && <img src={qrCode} alt="QR" className="hidden print:block w-24 h-24 object-contain" />}
              <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Scan to Pay</span>
            </div>
          </div>
          <div className="flex-1 text-[10px] text-center md:text-right italic text-slate-400 leading-relaxed border-t md:border-t-0 pt-4 md:pt-0">
             *Please verify drawings and dimensions before execution. 
             <p className="font-black text-slate-700 uppercase mt-2 text-xs">THANK YOU FOR CHOOSING {companyName}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="p-4 bg-slate-50 flex flex-wrap gap-2 no-print border-t border-slate-100 pb-12">
          <button onClick={() => window.print()} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 active:scale-95 shadow-md"><Download size={18}/> PRINT PDF</button>
          <button onClick={onShare} className="flex-1 bg-emerald-500 text-white py-4 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 active:scale-95 shadow-md"><Share2 size={18}/> SHARE</button>
          <button onClick={handleReset} className="w-full md:w-auto bg-white text-red-500 py-4 px-8 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 border border-red-100 shadow-sm"><RotateCcw size={18}/> RESET</button>
        </div>
      </div>
      <p className="py-6 text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] no-print">Uniq Designs AI Terminal</p>
    </div>
  );
};

export default PaymentTracker;
