import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Download, Share2, Trash2, Plus, Building2, Camera, Landmark, QrCode } from 'lucide-react';

interface PaymentRow {
  id: number;
  description: string;
  quantity: string | number;
  rate: string | number;
}

const PaymentTracker: React.FC = () => {
  const [logo, setLogo] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  
  const [invoiceLabel, setInvoiceLabel] = useState('INVOICE');
  const [advanceLabel, setAdvanceLabel] = useState('ADVANCE PAID:');
  const [snoLabel, setSnoLabel] = useState('S.NO');

  const [companyName, setCompanyName] = useState('UNIQ DESIGNS');
  const [engineerName, setEngineerName] = useState('Structural Engineer : M. Prakash M.E.,');
  const [address, setAddress] = useState('NO: 14/2, 1st Floor, Thambiran street, Trichy - 620005.');
  
  const [clientName, setClientName] = useState('Client Name');
  const [invoiceNo, setInvoiceNo] = useState('INV-8156');
  const [invoiceDate, setInvoiceDate] = useState('2026-04-14');

  const [advanceInput, setAdvanceInput] = useState<string | number>(2000);
  const [rows, setRows] = useState<PaymentRow[]>([
    { id: 1, description: 'Structural Design Service', quantity: 1000, rate: 5 }
  ]);

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
    <div className="min-h-screen bg-gray-100 font-sans print:bg-white overflow-x-hidden">
      <style>{`
        @media print {
          @page { 
            size: A4 portrait; 
            margin: 5mm; 
          }
          body { -webkit-print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-container { 
            box-shadow: none !important; 
            border: none !important; 
            width: 100% !important; 
            margin: 0 !important;
            padding: 0 !important;
          }
          input, textarea { border: none !important; outline: none !important; }
        }
      `}</style>

      <div className="max-w-[100%] md:max-w-[750px] mx-auto bg-white shadow-lg print-container min-h-screen md:min-h-fit md:my-4">
        
        {/* Header Section */}
        <div className="p-4 flex justify-between items-start gap-2">
          <div className="flex-1 overflow-hidden">
             <div 
               className="w-32 h-20 md:w-44 md:h-24 bg-gray-50 border border-dashed border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer overflow-hidden mb-3 no-print"
               onClick={() => logoRef.current?.click()}
             >
               {logo ? <img src={logo} alt="Logo" className="w-full h-full object-contain" /> : <Camera size={20} className="text-gray-300"/>}
               <input type="file" ref={logoRef} hidden accept="image/*" onChange={(e) => handleImageUpload(e, setLogo)} />
             </div>
             {logo && <img src={logo} alt="Logo" className="hidden print:block w-40 h-24 object-contain mb-2" />}

             <input className="block w-full text-lg md:text-xl font-black outline-none leading-tight" value={companyName} onChange={e => setCompanyName(e.target.value)} />
             <input className="block w-full text-[10px] md:text-xs font-bold text-gray-600 outline-none" value={engineerName} onChange={e => setEngineerName(e.target.value)} />
             <input className="block w-full text-[9px] text-gray-400 outline-none truncate" value={address} onChange={e => setAddress(e.target.value)} />
          </div>
          <div className="text-right flex flex-col items-end">
            <input 
              className="text-xl md:text-2xl font-black text-gray-800 text-right outline-none w-32 md:w-48 bg-transparent" 
              value={invoiceLabel} 
              onChange={e => setInvoiceLabel(e.target.value)} 
            />
          </div>
        </div>

        {/* Bill Info Grid */}
        <div className="grid grid-cols-2 border-y-2 border-gray-900">
          <div className="p-3 border-r-2 border-gray-900">
            <p className="text-[9px] font-black text-blue-600 mb-1">BILL TO</p>
            <input className="w-full font-bold text-sm outline-none bg-transparent" value={clientName} onChange={e => setClientName(e.target.value)} />
          </div>
          <div className="p-3">
            <p className="text-[9px] font-black text-blue-600 mb-1 uppercase tracking-tighter">Invoice Details</p>
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-400">NO:</span>
              <input className="text-right font-bold outline-none w-20" value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} />
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-400">DATE:</span>
              <input type="text" className="text-right font-bold outline-none w-24" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Professional Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#1e293b] text-white text-[10px] uppercase">
                <th className="py-2 px-1 border-r border-slate-700 w-10">
                  <input className="bg-transparent text-center w-full outline-none" value={snoLabel} onChange={e => setSnoLabel(e.target.value)} />
                </th>
                <th className="py-2 px-3 border-r border-slate-700 text-left">DESCRIPTION</th>
                <th className="py-2 px-1 border-r border-slate-700 w-12 text-center">QTY</th>
                <th className="py-2 px-1 border-r border-slate-700 w-16 text-center">RATE</th>
                <th className="py-2 px-2 text-right w-24">AMOUNT</th>
              </tr>
            </thead>
            <tbody className="text-[10px] md:text-xs">
              {rows.map((row, index) => (
                <tr key={row.id} className="border-b border-gray-100">
                  <td className="py-3 text-center text-gray-300 font-bold border-r border-gray-50">{index + 1}</td>
                  <td className="py-3 px-3 border-r border-gray-50">
                    <input className="w-full font-bold text-slate-700 outline-none" value={row.description} onChange={e => updateRow(row.id, 'description', e.target.value)} />
                  </td>
                  <td className="py-3 border-r border-gray-50">
                    <input className="w-full text-center outline-none font-medium" value={row.quantity} onChange={e => updateRow(row.id, 'quantity', e.target.value)} />
                  </td>
                  <td className="py-3 border-r border-gray-50">
                    <input className="w-full text-center font-bold text-blue-600 outline-none" value={row.rate} onChange={e => updateRow(row.id, 'rate', e.target.value)} />
                  </td>
                  <td className="py-3 px-2 text-right font-black">₹{((Number(row.quantity) || 0) * (Number(row.rate) || 0)).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => setRows([...rows, {id: Date.now(), description: '', quantity: '', rate: ''}])} className="p-2 text-blue-500 font-bold text-[10px] flex items-center gap-1 no-print"><Plus size={12}/> ADD ITEM</button>
        </div>

        {/* Calculation Section */}
        <div className="p-4 space-y-3 bg-white">
          <div className="flex justify-between items-center px-2">
            <span className="text-gray-400 font-bold text-xs uppercase">Grand Total:</span>
            <span className="text-xl font-black">₹{totalWorkValue.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
            <input 
               className="text-[10px] font-black text-green-600 bg-transparent outline-none uppercase w-32" 
               value={advanceLabel} 
               onChange={e => setAdvanceLabel(e.target.value)} 
            />
            <div className="flex items-center gap-1">
              <span className="text-green-600 text-[10px]">₹</span>
              <input className="w-20 text-right font-black text-green-600 bg-transparent outline-none" value={advanceInput} onChange={e => setAdvanceInput(handleNumericInput(e.target.value))} />
            </div>
          </div>

          <div className="flex justify-between items-center bg-[#0f172a] text-white p-4 rounded-xl">
            <span className="font-black text-[10px] tracking-widest uppercase">BALANCE DUE:</span>
            <span className="text-2xl font-black">₹{balanceDue.toLocaleString()}</span>
          </div>
        </div>

        {/* Bank & Footer Section */}
        <div className="p-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex justify-between items-end gap-2">
            <div className="space-y-0.5">
              <p className="text-[9px] font-black text-gray-300 flex items-center gap-1 mb-1"><Landmark size={10}/> BANK INFO</p>
              <input className="block font-black text-xs outline-none uppercase" value={bankName} onChange={e => setBankName(e.target.value)} />
              <input className="block text-[10px] font-bold text-gray-600 outline-none" value={accName} onChange={e => setAccName(e.target.value)} />
              <input className="block text-[10px] text-gray-500 outline-none font-mono" value={accNo} onChange={e => setAccNo(e.target.value)} />
            </div>

            {/* QR Scanner Area */}
            <div className="flex flex-col items-center">
              <div 
                className="w-20 h-20 bg-gray-50 border border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer overflow-hidden no-print"
                onClick={() => qrRef.current?.click()}
              >
                {qrCode ? <img src={qrCode} alt="QR" className="w-full h-full object-cover" /> : <QrCode size={18} className="text-gray-300" />}
                <input type="file" ref={qrRef} hidden accept="image/*" onChange={(e) => handleImageUpload(e, setQrCode)} />
              </div>
              {qrCode && <img src={qrCode} alt="QR" className="hidden print:block w-20 h-20 object-cover" />}
              <span className="text-[7px] font-black text-gray-300 mt-1 uppercase">Scan to Pay</span>
            </div>
          </div>

          <div className="text-[9px] md:text-right italic text-gray-400 flex flex-col justify-end">
             *Please verify drawings and dimensions before execution. 
             <p className="font-black text-gray-600 uppercase mt-0.5">THANK YOU FOR CHOOSING {companyName}</p>
          </div>
        </div>

        {/* Actions - No Print */}
        <div className="p-3 bg-gray-50 flex gap-2 no-print pb-8">
          <button onClick={() => window.print()} className="flex-1 bg-slate-900 text-white py-4 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 active:scale-95 transition-all">
            <Download size={16}/> PRINT PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentTracker;
