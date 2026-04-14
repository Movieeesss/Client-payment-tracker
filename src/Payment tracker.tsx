import React, { useState, useEffect } from 'react';
import { Download, Share2, Trash2, Plus } from 'lucide-react';

interface PaymentRow {
  id: number;
  description: string;
  quantity: number;
  rate: number;
}

const PaymentTracker: React.FC = () => {
  const [companyName, setCompanyName] = useState('UNIQ DESIGNS');
  const [clientName, setClientName] = useState('Client Name / Project');
  const [advanceAmount, setAdvanceAmount] = useState<number>(2000);
  const [rows, setRows] = useState<PaymentRow[]>([
    { id: 1, description: 'Structural Design Work', quantity: 1, rate: 5000 }
  ]);

  const addRow = () => {
    const newRow = { id: Date.now(), description: '', quantity: 0, rate: 0 };
    setRows([...rows, newRow]);
  };

  const updateRow = (id: number, field: keyof PaymentRow, value: string | number) => {
    setRows(rows.map(row => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const deleteRow = (id: number) => {
    if (rows.length > 1) {
      setRows(rows.filter(row => row.id !== id));
    }
  };

  const calculateTotal = () => rows.reduce((sum, row) => sum + (row.quantity * row.rate), 0);
  const totalAmount = calculateTotal();
  const balance = totalAmount - advanceAmount;

  const handleWhatsAppShare = () => {
    const text = `*Payment Invoice - ${companyName}*\n\nClient: ${clientName}\nTotal Amount: ₹${totalAmount}\nAdvance Paid: ₹${advanceAmount}\n*Balance Due: ₹${balance}*`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 bg-white shadow-xl rounded-none md:rounded-2xl border border-gray-200 my-4 md:my-10 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start border-b-4 border-blue-800 pb-6 mb-8 gap-4">
        <div>
          <input 
            className="text-3xl font-black text-blue-900 uppercase outline-none w-full bg-transparent"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <p className="text-gray-500 font-medium tracking-widest text-xs mt-1">STRUCTURAL CONSULTANCY & DESIGN</p>
        </div>
        <div className="md:text-right w-full md:w-auto bg-blue-50 p-3 rounded-lg">
          <label className="block text-[10px] font-bold text-blue-400 uppercase">Billed To</label>
          <input 
            className="text-lg font-bold text-gray-800 md:text-right outline-none bg-transparent w-full"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-2 border-gray-100 text-gray-400 text-[11px] uppercase tracking-tighter">
              <th className="py-3 px-2">S.No</th>
              <th className="py-3 px-2">Work Description</th>
              <th className="py-3 px-2 text-center">Qty (Sq.Ft)</th>
              <th className="py-3 px-2 text-center">Rate</th>
              <th className="py-3 px-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {rows.map((row, index) => (
              <tr key={row.id} className="border-b border-gray-50 group">
                <td className="py-4 px-2 text-gray-400 font-medium">{index + 1}</td>
                <td className="py-4 px-2">
                  <input 
                    className="w-full font-semibold text-gray-700 outline-none focus:text-blue-600 bg-transparent"
                    placeholder="Enter work details..."
                    value={row.description}
                    onChange={(e) => updateRow(row.id, 'description', e.target.value)}
                  />
                </td>
                <td className="py-4 px-2 text-center">
                  <input 
                    type="number"
                    className="w-16 text-center outline-none bg-gray-50 rounded"
                    value={row.quantity}
                    onChange={(e) => updateRow(row.id, 'quantity', parseFloat(e.target.value) || 0)}
                  />
                </td>
                <td className="py-4 px-2 text-center">
                  <input 
                    type="number"
                    className="w-20 text-center font-bold outline-none bg-gray-50 rounded text-blue-700"
                    value={row.rate}
                    onChange={(e) => updateRow(row.id, 'rate', parseFloat(e.target.value) || 0)}
                  />
                </td>
                <td className="py-4 px-2 text-right font-bold text-gray-900">
                  ₹{(row.quantity * row.rate).toLocaleString()}
                </td>
                <td className="w-10">
                   <button onClick={() => deleteRow(row.id)} className="text-red-300 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={addRow} className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded">
        <Plus size={14} /> ADD ITEM
      </button>

      {/* Summary Section */}
      <div className="mt-8 flex flex-col items-end border-t-2 border-gray-50 pt-6">
        <div className="w-full md:w-72 space-y-3">
          <div className="flex justify-between text-gray-500 font-medium">
            <span>Total Work Value:</span>
            <span>₹{totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-green-600 font-bold">
            <span>Advance Received:</span>
            <div className="flex items-center">
               <span className="mr-1">₹</span>
               <input 
                type="number"
                className="w-24 text-right bg-green-50 rounded px-1 outline-none border border-green-100"
                value={advanceAmount}
                onChange={(e) => setAdvanceAmount(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
          <div className={`flex justify-between p-4 rounded-xl ${balance > 0 ? 'bg-orange-50 text-orange-700' : 'bg-green-600 text-white'}`}>
            <span className="font-bold">{balance > 0 ? 'Balance Due:' : 'Status:'}</span>
            <span className="text-xl font-black">
              {balance > 0 ? `₹${balance.toLocaleString()}` : 'FULLY PAID'}
            </span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-10 grid grid-cols-2 gap-4 print:hidden">
        <button onClick={() => window.print()} className="bg-gray-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all active:scale-95">
          <Download size={20} /> PRINT PDF
        </button>
        <button onClick={handleWhatsAppShare} className="bg-[#25D366] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all active:scale-95">
          <Share2 size={20} /> WHATSAPP
        </button>
      </div>

      <footer className="mt-12 text-center border-t border-gray-100 pt-6">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Authorized Electronic Invoice - {companyName}</p>
      </footer>
    </div>
  );
};

export default PaymentTracker;
