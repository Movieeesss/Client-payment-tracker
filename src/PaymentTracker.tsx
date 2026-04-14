import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Download, Share2, Trash2, Plus, Building2, User, Camera, Landmark, FileText } from 'lucide-react';

interface PaymentRow {
  id: number;
  description: string;
  quantity: string | number;
  rate: string | number;
}

const PaymentTracker: React.FC = () => {
  // Logo State
  const [logo, setLogo] = useState<string | null>(null);
  
  // Header Info States
  const [companyName, setCompanyName] = useState('UNIQ DESIGNS');
  const [engineerName, setEngineerName] = useState('Structural Engineer : M. Prakash M.E.,');
  const [address, setAddress] = useState('NO: 14/2, 1st Floor, Thambiran street, Trichy - 620005.');
  
  // Client & Invoice Details
  const [clientName, setClientName] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('INV-' + Date.now().toString().slice(-4));
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);

  // Payment Logic
  const [advanceInput, setAdvanceInput] = useState<string | number>(2000);
  const [rows, setRows] = useState<PaymentRow[]>([
    { id: 1, description: 'Structural Design Service', quantity: 1000, rate: 5 }
  ]);

  // Bank Details
  const [bankDetails, setBankDetails] = useState({
    bank: 'INDIAN BANK',
    accName: 'PRAKASH M',
    accNo: '6231059572',
    ifsc: 'IDIB000S110'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result as string);
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

  // Neenga ketta Share Logic
  const onShare = async () => {
    const shareText = `*Invoice from ${companyName}*\nClient: ${clientName}\nTotal: ₹${totalWorkValue}\nBalance: ₹${balanceDue}\n\nShared via Uniq App`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Invoice', text: shareText });
      } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans p-2 md:p-6 pb-20">
      <div className="max-w-lg mx-auto bg-white shadow-2xl rounded-xl overflow-hidden border border-gray-200">
        
        {/* Top Header - Logo & Contact */}
        <div className="p-4 border-b-2 border-gray-800 flex justify-between items-start bg-white">
          <div className="flex-1">
             <div className="relative w-20 h-20 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden mb-2" onClick={() => fileInputRef.current?.click()}>
               {logo ? <img src={logo} alt="Logo" className="w-full h-full object-contain" /> : <Camera size={24} className="text-gray-400" />}
               <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleLogoUpload} />
             </div>
             <input className="block w-full text-xl font-black text-black outline-none" value={companyName} onChange={e => setCompanyName(e.target.value)} />
             <input className="block w-full text-[10px] font-bold text-gray-700 outline-none" value={engineerName} onChange={e => setEngineerName(e.target.value)} />
             <textarea className="block w-full text-[9px] text-gray-500 outline-none h-10 resize-none" value={address} onChange={e => setAddress(e.target.value)} />
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-black tracking-tighter text-gray-800">INVOICE</h1>
          </div>
        </div>

        {/* Client & Invoice Details Grid */}
        <div className="grid grid-cols-2 border-b border-gray-300">
          <div className="p-3 border-r border-gray-300 bg-gray-50/50">
            <p className="text-[10px] font-black uppercase text-blue-600 mb-1">Bill To</p>
            <input placeholder="Client Name" className="w-full bg-transparent font-bold text-sm outline-none" value={clientName} onChange={e => setClientName(e.target.value)} />
          </div>
          <div className="p-3 bg-white">
            <p className="text-[10px] font-black uppercase text-blue-600 mb-1">Invoice Details</p>
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-gray-400 uppercase">No:</span>
              <input className="text-right font-bold outline-none w-20" value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} />
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-400 uppercase">Date:</span>
              <input type="date" className="text-right font-bold outline-none" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Professional Table Format */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-800 text-white text-[10px] uppercase font-bold text-center">
                <th className="py-2 px-1 border-r border-gray-700 w-10">S.No</th>
                <th className="py-2 px-2 border-r border-gray-700 text-left">Description</th>
                <th className="py-2 px-1 border-r border-gray-700">Qty</th>
                <th className="py-2 px-1 border-r border-gray-700">Rate</th>
                <th className="py-2 px-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="text-[11px]">
              {rows.map((row, index) => (
                <tr key={row.id} className="border-b border-gray-200 align-top">
                  <td className="p-2 text-center text-gray-400 border-r border-gray-100 font-bold">{index + 1}</td>
                  <td className="p-2 border-r border-gray-100">
                    <input className="w-full font-bold text-gray-700 outline-none" value={row.description} onChange={e => updateRow(row.id, 'description', e.target.value)} />
                  </td>
                  <td className="p-2 border-r border-gray-100">
                    <input type="number" className="w-full text-center outline-none" value={row.quantity} onChange={e => updateRow(row.id, 'quantity', e.target.value)} />
                  </td>
                  <td className="p-2 border-r border-gray-100">
                    <input type="number" className="w-full text-center font-bold text-blue-600 outline-none" value={row.rate} onChange={e => updateRow(row.id, 'rate', e.target.value)} />
                  </td>
                  <td className="p-2 text-right font-black">₹{((Number(row.quantity) || 0) * (Number(row.rate) || 0)).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => setRows([...rows, {id: Date.now(), description: '', quantity: '', rate: ''}])} className="p-2 text-blue-500 font-bold text-[10px] flex items-center gap-1"><Plus size={12}/> ADD ITEM</button>
        </div>

        {/* Calculation Summary */}
        <div className="bg-gray-50 p-4 space-y-2 border-t border-gray-300">
          <div className="flex justify-between items-center text-sm">
            <span className="font-bold text-gray-500">Grand Total:</span>
            <span className="font-black text-lg">₹{totalWorkValue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm border-t border-gray-200 pt-2 text-green-600">
            <span className="font-bold uppercase text-[10px]">Advance Paid:</span>
            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border">
              <span className="text-[10px]">₹</span>
              <input type="number" className="w-20 text-right font-bold outline-none" value={advanceInput} onChange={e => setAdvanceInput(handleNumericInput(e.target.value))} />
            </div>
          </div>
          <div className="flex justify-between items-center bg-gray-900 text-white p-3 rounded-xl mt-2">
            <span className="text-xs font-bold uppercase tracking-widest">Balance Due:</span>
            <span className="text-xl font-black">₹{balanceDue.toLocaleString()}</span>
          </div>
        </div>

        {/* Bank Details Editable Section */}
        <div className="p-4 bg-white border-t border-gray-200 grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1"><Landmark size={10}/> Bank Info</p>
            <input className="block w-full text-[11px] font-bold outline-none" value={bankDetails.bank} onChange={e => setBankDetails({...bankDetails, bank: e.target.value})} />
            <input className="block w-full text-[11px] outline-none" value={bankDetails.accName} onChange={e => setBankDetails({...bankDetails, accName: e.target.value})} />
            <input className="block w-full text-[11px] font-mono outline-none" value={bankDetails.accNo} onChange={e => setBankDetails({...bankDetails, accNo: e.target.value})} />
          </div>
          <div className="text-[9px] text-gray-400 italic">
            *Please verify drawings and dimensions before execution. Thank you for choosing UNIQ DESIGNS.
          </div>
        </div>

        {/* Mobile Action Buttons */}
        <div className="p-4 grid grid-cols-2 gap-3 bg-white border-t border-gray-100">
          <button onClick={() => window.print()} className="flex items-center justify-center gap-2 bg-gray-800 text-white py-4 rounded-xl font-black text-[11px] uppercase active:scale-95 transition-all">
            <Download size={18} /> Print PDF
          </button>
          <button onClick={onShare} className="flex items-center justify-center gap-2 bg-green-500 text-white py-4 rounded-xl font-black text-[11px] uppercase shadow-lg shadow-green-500/20 active:scale-95 transition-all">
            <Share2 size={18} /> Share Invoice
          </button>
        </div>

      </div>
    </div>
  );
};

export default PaymentTracker;
