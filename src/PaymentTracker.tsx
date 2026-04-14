import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Download, Share2, Trash2, Plus, Building2, Camera, Landmark, QrCode, RotateCcw } from 'lucide-react';

interface PaymentRow {
  id: number;
  description: string;
  quantity: string | number;
  rate: string | number;
}

const PaymentTracker: React.FC = () => {
  // Initial State for Reset
  const initialRows = [{ id: 1, description: 'Structural Design Service', quantity: 1000, rate: 5 }];

  // Helper to get from Local Storage
  const getSaved = (key: string, def: any) => {
    const s = localStorage.getItem(key);
    if (!s) return def;
    try { return JSON.parse(s); } catch { return s; }
  };

  // States with Local Storage Integration
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

  // Auto-Save Effect
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
    <div className="min-h-screen bg-gray-50 font-sans print:bg-white pb-6 overflow-x-hidden flex flex-col items-center">
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 8mm; }
          body { background: white; -webkit-print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-container { border: none !important; box-shadow: none !important; width: 100% !important; margin: 0 !important; }
        }
      `}</style>

      <div className="w-full max-w-[100%] md:max-w-[800px] bg-white shadow-xl md:rounded-xl border border-gray-200 print-container overflow-hidden">
        
        {/* Header */}
        <div className="p-4 md:p-6 flex justify-between items-start gap-2">
          <div className="flex-1">
             <div className="w-40 h-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer no-print mb-4" onClick={() => logoRef.current?.click()}>
               {logo ? <img src={logo} alt="Logo" className="w-full h-full object-contain" /> : <Camera size={20} className="text-gray-300"/>}
               <input type="file" ref={logoRef} hidden accept="image/*" onChange={e => handleImage(e, setLogo)} />
             </div>
             {logo && <img src={logo} className="hidden print:block w-40 h-20 object-contain mb-2" />}
             <input className="block w-full text-xl font-black outline-none uppercase text-blue-900" value={companyName} onChange={e => setCompanyName(e.target.value)} />
             <input className="block w-full text-[10px] font-bold text-gray-600 outline-none" value={engineerName} onChange={e => setEngineerName(e.target.value)} />
             <input className="block w-full text-[9px] text-gray-400 outline-none truncate" value={address} onChange={e => setAddress(e.target.value)} />
          </div>
          <input className="text-2xl font-black text-gray-800 text-right outline-none uppercase w-32 bg-transparent" value={invoiceLabel} onChange={e => setInvoiceLabel(e.target.value)} />
        </div>

        {/* Bill Info */}
        <div className="grid grid-cols-2 border-y-2 border-gray-900">
          <div className="p-3 border-r-2 border-gray-900 bg-blue-50/20">
            <p className="text-[9px] font-black text-blue-600 mb-1">BILL TO</p>
            <input className="w-full font-bold text-sm outline-none bg-transparent" value={clientName} onChange={e => setClientName(e.target.value)} />
          </div>
          <div className="p-3">
            <p className="text-[9px] font-black text-blue-600 mb-1">INVOICE DETAILS</p>
            <div className="flex justify-between text-[10px] mb-0.5"><span>NO:</span><input className="text-right font-bold outline-none w-20" value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} /></div>
            <div className="flex justify-between text-[10px]"><span>DATE:</span><input type="date" className="text-right font-bold outline-none w-28 bg-transparent" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} /></div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-800 text-white text-[10px] uppercase">
                <th className="py-2 border-r border-slate-700 w-12"><input className="bg-transparent text-center w-full outline-none" value={snoLabel} onChange={e => setSnoLabel(e.target.value)} /></th>
                <th className="py-2 px-3 border-r border-slate-700 text-left">DESCRIPTION</th>
                <th className="py-2 border-r border-slate-700 w-16">QTY</th>
                <th className="py-2 border-r border-slate-700 w-20">RATE</th>
                <th className="py-2 px-3 text-right w-24">AMOUNT</th>
              </tr>
            </thead>
            <tbody className="text-[10px] md:text-xs">
              {rows.map((row, index) => (
                <tr key={row.id} className="border-b border-gray-100">
                  <td className="py-3 text-center text-gray-300 font-bold border-r">{index + 1}</td>
                  <td className="py-3 px-3 border-r"><input className="w-full font-bold outline-none" value={row.description} onChange={e => updateRow(row.id, 'description', e.target.value)} /></td>
                  <td className="py-3 border-r"><input className="w-full text-center outline-none" value={row.quantity} onChange={e => updateRow(row.id, 'quantity', e.target.value)} /></td>
                  <td className="py-3 border-r"><input className="w-full text-center font-bold text-blue-600 outline-none" value={row.rate} onChange={e => updateRow(row.id, 'rate', e.target.value)} /></td>
                  <td className="py-3 px-3 text-right font-black">₹{((Number(row.quantity) || 0) * (Number(row.rate) || 0)).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => setRows([...rows, {id: Date.now(), description: '', quantity: '', rate: ''}])} className="p-2 text-blue-500 font-bold text-[10px] no-print flex items-center gap-1"><Plus size={12}/> ADD ITEM</button>
        </div>

        {/* Calculation */}
        <div className="p-4 space-y-3 bg-white">
          <div className="flex justify-between items-center px-2"><span className="text-gray-400 font-bold text-[10px] uppercase tracking-tighter">Grand Total:</span><span className="text-xl font-black">₹{totalAmount.toLocaleString()}</span></div>
          <div className="flex justify-between items-center px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
            <input className="text-[10px] font-black text-green-600 bg-transparent outline-none uppercase w-32" value={advanceLabel} onChange={e => setAdvanceLabel(e.target.value)} />
            <div className="flex items-center gap-1"><span className="text-green-600 text-[10px]">₹</span><input className="w-20 text-right font-black text-green-600 bg-transparent outline-none" value={advanceInput} onChange={e => setAdvanceInput(handleNumericInput(e.target.value))} /></div>
          </div>
          <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-xl shadow-lg">
            <span className="font-black text-[10px] tracking-widest uppercase">BALANCE DUE:</span>
            <span className="text-2xl font-black font-mono">₹{balance.toLocaleString()}</span>
          </div>
        </div>

        {/* Footer Realignment */}
        <div className="p-4 border-t border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
            <div className="space-y-0.5 min-w-[150px]">
              <p className="text-[9px] font-black text-blue-600 uppercase flex items-center gap-1 mb-1"><Landmark size={10}/> Bank Info</p>
              <input className="block font-black text-xs outline-none bg-transparent" value={bankName} onChange={e => setBankName(e.target.value)} />
              <input className="block text-[10px] font-bold text-gray-600 outline-none bg-transparent" value={accName} onChange={e => setAccName(e.target.value)} />
              <input className="block text-[10px] text-gray-500 outline-none font-mono bg-transparent" value={accNo} onChange={e => setAccNo(e.target.value)} />
            </div>

            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-50 border border-dashed border-gray-200 rounded flex items-center justify-center cursor-pointer no-print" onClick={() => qrRef.current?.click()}>
                {qrCode ? <img src={qrCode} alt="QR" className="w-full h-full object-cover" /> : <QrCode size={18} className="text-gray-200" />}
                <input type="file" ref={qrRef} hidden accept="image/*" onChange={e => handleImage(e, setQrCode)} />
              </div>
              {qrCode && <img src={qrCode} className="hidden print:block w-20 h-20 object-contain" />}
              <span className="text-[7px] font-bold text-gray-400 mt-1 uppercase">Scan to Pay</span>
            </div>
          </div>

          <div className="flex-1 text-[9px] md:text-right italic text-gray-400 leading-relaxed border-t md:border-t-0 pt-4 md:pt-0 w-full">
            *Please verify drawings and dimensions before execution. 
            <p className="font-black text-gray-600 uppercase mt-0.5">THANK YOU FOR CHOOSING {companyName}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="p-4 bg-gray-50 flex flex-wrap gap-2 no-print pb-10">
          <button onClick={() => window.print()} className="flex-1 bg-slate-900 text-white py-4 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 active:scale-95 transition-all"><Download size={16}/> PRINT PDF</button>
          <button onClick={onShare} className="flex-1 bg-green-500 text-white py-4 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 active:scale-95 transition-all"><Share2 size={16}/> SHARE</button>
          <button onClick={handleReset} className="w-full md:w-auto bg-red-50 text-red-500 py-4 px-6 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 border border-red-100"><RotateCcw size={16}/> RESET</button>
        </div>
      </div>
    </div>
  );
};

export default PaymentTracker;
