import React, { useState } from 'react';
import { Download, Share2, Trash2, Plus } from 'lucide-react';

interface PaymentRow {
  id: number;
  description: string;
  quantity: number;
  rate: number;
  advance: number;
}

const PaymentTracker: React.FC = () => {
  const [companyName, setCompanyName] = useState('UNIQ DESIGNS');
  const [clientName, setClientName] = useState('Client Name / Project');
  const [rows, setRows] = useState<PaymentRow[]>([
    { id: 1, description: 'Structural Design Work', quantity: 1, rate: 5000, advance: 2000 }
  ]);

  const addRow = () => {
    const newRow = { id: Date.now(), description: '', quantity: 0, rate: 0, advance: 0 };
    setRows([...rows, newRow]);
  };

  const updateRow = (id: number, field: keyof PaymentRow, value: string | number) => {
    setRows(rows.map(row => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const deleteRow = (id: number) => {
    setRows(rows.filter(row => row.id !== id));
  };

  const calculateTotal = () => rows.reduce((sum, row) => sum + (row.quantity * row.rate), 0);
  const calculatePaid = () => rows.reduce((sum, row) => sum + Number(row.advance), 0);
  const balance = calculateTotal() - calculatePaid();

  const handleWhatsAppShare = () => {
    const text = `*Payment Invoice - ${companyName}*\nClient: ${clientName}\nTotal: ₹${calculateTotal()}\nPaid: ₹${calculatePaid()}\nBalance: ₹${balance}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-2xl rounded-xl border border-gray-100 my-10">
      {/* Header Section */}
      <div className="flex justify-between items-start border-b-2 border-blue-600 pb-6 mb-8">
        <div>
          <input 
            className="text-2xl font-bold text-blue-700 uppercase outline-none border-b border-transparent focus:border-blue-300"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <p className="text-gray-500 text-sm mt-1">Structural Engineering Services</p>
        </div>
        <div className="text-right">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Client Info</label>
          <input 
            className="text-xl font-semibold text-gray-800 text-right outline-none border-b border-transparent focus:border-blue-300"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
              <th className="p-3 border-b">S.No</th>
              <th className="p-3 border-b">Description</th>
              <th className="p-3 border-b text-center">Qty (Sq.Ft)</th>
              <th className="p-3 border-b text-center">Rate</th>
              <th className="p-3 border-b text-center">Total Amount</th>
              <th className="p-3 border-b text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-3 border-b text-gray-500">{index + 1}</td>
                <td className="p-3 border-b">
                  <input 
                    className="w-full bg-transparent outline-none focus:ring-1 ring-blue-200 rounded p-1"
                    value={row.description}
                    onChange={(e) => updateRow(row.id, 'description', e.target.value)}
                  />
                </td>
                <td className="p-3 border-b">
                  <input 
                    type="number"
                    className="w-20 mx-auto block text-center bg-transparent outline-none"
                    value={row.quantity}
                    onChange={(e) => updateRow(row.id, 'quantity', parseFloat(e.target.value) || 0)}
                  />
                </td>
                <td className="p-3 border-b">
                  <input 
                    type="number"
                    className="w-24 mx-auto block text-center bg-transparent outline-none font-medium"
                    value={row.rate}
                    onChange={(e) => updateRow(row.id, 'rate', parseFloat(e.target.value) || 0)}
                  />
                </td>
                <td className="p-3 border-b text-center font-semibold">
                  ₹{(row.quantity * row.rate).toLocaleString()}
                </td>
                <td className="p-3 border-b text-center">
                  <button onClick={() => deleteRow(row.id)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button 
        onClick={addRow}
        className="mt-4 flex items-center gap-2 text-blue-600 font-semibold hover:bg-blue-50 px-3 py-1 rounded-lg transition-all"
      >
        <Plus size={18} /> Add Line Item
      </button>

      {/* Payment Summary Section */}
      <div className="mt-10 flex flex-col items-end gap-3 border-t pt-6">
        <div className="flex justify-between w-64 text-gray-600">
          <span>Gross Total:</span>
          <span className="font-bold text-gray-900">₹{calculateTotal().toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between w-64 items-center">
          <span className="text-green-600 font-semibold text-sm">Advance Received:</span>
          <input 
            type="number"
            className="w-24 text-right font-bold text-green-700 bg-green-50 rounded p-1 outline-none border border-green-200"
            value={rows[0]?.advance || 0}
            onChange={(e) => updateRow(rows[0].id, 'advance', parseFloat(e.target.value) || 0)}
          />
        </div>

        <div className={`flex justify-between w-64 p-3 rounded-lg ${balance > 0 ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
          <span className="font-bold uppercase text-xs">Remaining Balance:</span>
          <span className="font-black text-lg text-right">₹{balance.toLocaleString()}</span>
        </div>

        {balance === 0 && (
          <div className="bg-green-100 text-green-800 px-4 py-1 rounded-full text-xs font-bold animate-pulse">
            FULLY PAID - FINAL BILL
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-10 flex gap-4 border-t pt-8">
        <button 
          onClick={() => window.print()}
          className="flex-1 bg-gray-800 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all"
        >
          <Download size={20} /> Get PDF
        </button>
        <button 
          onClick={handleWhatsAppShare}
          className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition-all"
        >
          <Share2 size={20} /> Share to WhatsApp
        </button>
      </div>
      
      <p className="text-center text-[10px] text-gray-400 mt-6 italic">
        Generated by {companyName} AI Tracker
      </p>
    </div>
  );
};

export default PaymentTracker;
