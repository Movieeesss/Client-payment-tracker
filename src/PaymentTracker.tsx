import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Download, Share2, RotateCcw, Plus, Landmark, Camera, QrCode } from 'lucide-react';

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

  const [logo, setLogo] = useState<string | null>(() => localStorage.getItem('p_logo'));
  const [qrCode, setQrCode] = useState<string | null>(() => localStorage.getItem('p_qr'));

  const [invoiceLabel, setInvoiceLabel] = useState(() => getSaved('p_label', 'INVOICE'));
  const [advanceLabel, setAdvanceLabel] = useState(() => getSaved('p_adv_lbl', 'ADVANCE PAID'));
  const [snoLabel, setSnoLabel] = useState(() => getSaved('p_sno_lbl', 'S.NO'));
  const [qtyLabel, setQtyLabel] = useState(() => getSaved('p_qty_lbl', 'QTY'));
  const [rateLabel, setRateLabel] = useState(() => getSaved('p_rate_lbl', 'RATE'));
  const [amtLabel, setAmtLabel] = useState(() => getSaved('p_amt_lbl', 'AMOUNT'));

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
      p_label: invoiceLabel, p_adv_lbl: advanceLabel, p_sno_lbl: snoLabel, p_qty_lbl: qtyLabel,
      p_rate_lbl: rateLabel, p_amt_lbl: amtLabel, p_comp: companyName, p_eng: engineerName,
      p_addr: address, p_client: clientName, p_inv_no: invoiceNo, p_date: invoiceDate,
      p_adv_val: advanceInput, p_rows: rows, p_bank: bankName, p_acc_n: accName, p_acc_no: accNo
    };
    Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, JSON.stringify(v)));
    if (logo) localStorage.setItem('p_logo', logo);
    if (qrCode) localStorage.setItem('p_qr', qrCode);
  }, [logo, qrCode, invoiceLabel, advanceLabel, snoLabel, qtyLabel, rateLabel, amtLabel, companyName, engineerName, address, clientName, invoiceNo, invoiceDate, advanceInput, rows, bankName, accName, accNo]);

  const logoRef = useRef<HTMLInputElement>(null);
  const qrRef = useRef<HTMLInputElement>(null);

  const handleReset = () => {
    if (window.confirm("Invoice data reset panna ok-va?")) {
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

  const updateRow = useCallback((id: number, field: keyof PaymentRow, value: string) => {
    setRows(prev => prev.map(row =>
      row.id === id ? { ...row, [field]: (field === 'quantity' || field === 'rate') ? (value === '' ? '' : parseFloat(value) || '') : value } : row
    ));
  }, []);

  const totalAmount = useMemo(() => rows.reduce((s, r) => s + ((Number(r.quantity) || 0) * (Number(r.rate) || 0)), 0), [rows]);
  const balance = totalAmount - (Number(advanceInput) || 0);

  const onShare = async () => {
    const text = `*Invoice: ${companyName}*\nTotal: ₹${totalAmount.toLocaleString()}\nBalance: ₹${balance.toLocaleString()}`;
    if (navigator.share) await navigator.share({ title: 'Invoice', text });
    else window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const formatDate = (d: string) => {
    if (!d) return '';
    try {
      const dt = new Date(d);
      return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return d; }
  };

  return (
    <div style={{ margin: 0, padding: 0, background: '#f1f5f9', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <style>{`
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; width: 100%; overflow-x: hidden; }

        @media print {
          @page { size: A4 portrait; margin: 0; }
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; overflow: visible !important; }
          .no-print { display: none !important; }
          .print-show { display: block !important; }
          .invoice-card {
            width: 210mm !important; 
            height: 297mm !important; 
            margin: 0 !important; 
            padding: 10mm !important;
            border-radius: 0 !important;
            box-shadow: none !important; 
            border: none !important;
            transform: scale(1);
            transform-origin: top center;
            overflow: hidden !important;
            display: flex !important;
            flex-direction: column !important;
          }
          .inv-footer { margin-top: auto !important; padding-bottom: 5mm !important; }
        }

        .invoice-card {
          width: 100%;
          max-width: 520px;
          margin: 0 auto;
          background: white;
          box-shadow: 0 4px 32px rgba(0,0,0,0.10);
          position: relative;
        }

        @media (min-width: 640px) {
          .invoice-card {
            margin: 24px auto;
            border-radius: 20px;
            overflow: hidden;
          }
        }

        .inv-header { padding: 16px 16px 12px; display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; background: #ffffff; }
        .inv-header-left { flex: 1; min-width: 0; }
        .logo-upload { width: 90px; height: 56px; background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; margin-bottom: 8px; overflow: hidden; }
        .logo-upload img { width: 100%; height: 100%; object-fit: contain; padding: 4px; }
        .company-name-input { display: block; width: 100%; font-size: 18px; font-weight: 900; text-transform: uppercase; color: #0f172a; border: none; outline: none; background: transparent; line-height: 1.2; }
        .sub-input { display: block; width: 100%; font-size: 10px; font-weight: 700; color: #64748b; border: none; outline: none; background: transparent; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
        
        .inv-right-block { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
        .invoice-label-input { font-size: 14px; font-weight: 900; color: #0f172a; letter-spacing: 0.1em; text-transform: uppercase; background: transparent; border: none; outline: none; text-align: right; width: 100px; }
        .logo-box-right { width: 120px; height: 65px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; position: relative; }
        .logo-box-right img { width: 100%; height: 100%; object-fit: contain; padding: 2px; }

        .bill-info { display: grid; grid-template-columns: 1fr 1fr; border-top: 2px solid #0f172a; border-bottom: 2px solid #0f172a; }
        .bill-to { padding: 10px 12px; border-right: 2px solid #0f172a; background: #f8fafc; }
        .bill-details { padding: 10px 12px; }
        .bill-label { font-size: 9px; font-weight: 900; color: #2563eb; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 4px; }
        .inv-details-label { font-size: 9px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
        .inv-details-value { font-size: 10px; font-weight: 900; color: #0f172a; border: none; outline: none; background: transparent; text-align: right; width: 100%; }
        .inv-details-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
        .client-input { width: 100%; font-size: 14px; font-weight: 700; color: #0f172a; border: none; outline: none; background: transparent; }

        .inv-table { width: 100%; border-collapse: collapse; }
        .inv-table thead tr { background: #0f172a; color: white; }
        .inv-table th { padding: 8px 4px; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; }
        .inv-table th input { background: transparent; color: white; border: none; outline: none; font-weight: 900; font-size: 8.5px; text-transform: uppercase; width: 100%; text-align: center; }
        .inv-table td { padding: 10px 4px; font-size: 11px; border-bottom: 1px solid #f1f5f9; }
        .inv-table td input { border: none; outline: none; background: transparent; font-size: 11px; width: 100%; }
        .col-sno { width: 28px; text-align: center; }
        .col-qty { width: 42px; text-align: center; }
        .col-rate { width: 44px; text-align: center; }
        .col-amt { width: 64px; text-align: right; padding-right: 8px !important; }
        .add-item-btn { padding: 10px 12px; color: #2563eb; font-weight: 900; font-size: 10px; text-transform: uppercase; display: flex; align-items: center; gap: 6px; background: none; border: none; cursor: pointer; letter-spacing: 0.05em; }

        .totals-section { padding: 14px 16px; background: #f8fafc; }
        .grand-total-row { display: flex; justify-content: space-between; align-items: center; padding: 4px 4px 10px; }
        .gt-label { font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.12em; }
        .gt-value { font-size: 20px; font-weight: 900; color: #0f172a; }
        .advance-box { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: white; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 4px rgba(0,0,0,0.05); margin-bottom: 10px; }
        .adv-label-input { font-size: 10px; font-weight: 900; color: #10b981; background: transparent; border: none; outline: none; text-transform: uppercase; width: 130px; }
        .adv-value-wrap { display: flex; align-items: center; gap: 2px; }
        .adv-value-input { font-size: 18px; font-weight: 900; color: #10b981; background: transparent; border: none; outline: none; text-align: right; width: 80px; }
        .balance-box { background: #0f172a; color: white; padding: 16px 20px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 20px rgba(15,23,42,0.3); }
        .bal-label { font-size: 10px; font-weight: 900; opacity: 0.5; text-transform: uppercase; letter-spacing: 0.12em; }
        .bal-value { font-size: 28px; font-weight: 900; font-family: monospace; }

        .inv-footer { padding: 16px; border-top: 1px solid #f1f5f9; }
        .footer-top { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 12px; }
        .bank-label { font-size: 9px; font-weight: 900; color: #2563eb; text-transform: uppercase; display: flex; align-items: center; gap: 4px; margin-bottom: 6px; }
        .bank-input { display: block; width: 100%; border: none; outline: none; background: transparent; font-size: 10px; }
        .bank-name { font-size: 11px; font-weight: 900; text-transform: uppercase; color: #0f172a; }
        .qr-box { width: 60px; height: 60px; background: #f8fafc; border: 1.5px dashed #e2e8f0; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; }
        .qr-box img { width: 100%; height: 100%; object-fit: cover; }
        .thanks-text { font-size: 11px; font-weight: 900; color: #0f172a; text-transform: uppercase; width: 130px; line-height: 1.2; text-align: right; }

        .action-bar { padding: 12px 16px 20px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 10px; }
        .action-row { display: flex; gap: 10px; }
        .btn-print, .btn-share { flex: 1; color: white; padding: 14px 8px; border-radius: 14px; font-weight: 900; font-size: 11px; text-transform: uppercase; display: flex; align-items: center; justify-content: center; gap: 8px; border: none; cursor: pointer; }
        .btn-print { background: #0f172a; } .btn-share { background: #10b981; }
        .btn-reset { width: 100%; background: white; color: #ef4444; padding: 12px; border-radius: 14px; font-weight: 900; font-size: 11px; text-transform: uppercase; display: flex; align-items: center; justify-content: center; gap: 8px; border: 1px solid #fee2e2; cursor: pointer; }
        .footer-brand { text-align: center; padding: 16px 0 24px; font-size: 8px; font-weight: 900; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.4em; }
      `}</style>

      <div className="invoice-card">
        {/* HEADER AREA - WHITE BACKGROUND FIXED */}
        <div className="inv-header">
          <div className="inv-header-left">
            <input className="company-name-input" value={companyName} onChange={e => setCompanyName(e.target.value)} />
            <input className="sub-input" value={engineerName} onChange={e => setEngineerName(e.target.value)} />
            <input className="sub-input" value={address} onChange={e => setAddress(e.target.value)} />
          </div>
          <div className="inv-right-block">
            <input className="invoice-label-input" value={invoiceLabel} onChange={e => setInvoiceLabel(e.target.value)} />
            <div className="logo-box-right no-print" onClick={() => logoRef.current?.click()}>
              {logo ? <img src={logo} alt="Logo" /> : <><Camera size={14} color="#cbd5e1" /><span style={{ fontSize: 7, color: '#cbd5e1', fontWeight: 800 }}>LOGO</span></>}
              <input type="file" ref={logoRef} hidden accept="image/*" onChange={e => handleImage(e, setLogo)} />
            </div>
            {logo && <div className="logo-box-right print-show" style={{ display: 'none' }}><img src={logo} alt="Logo" /></div>}
          </div>
        </div>

        {/* BILL INFO */}
        <div className="bill-info">
          <div className="bill-to">
            <p className="bill-label">BILL TO</p>
            <input className="client-input" value={clientName} onChange={e => setClientName(e.target.value)} />
          </div>
          <div className="bill-details">
            <div className="inv-details-row">
              <span className="inv-details-label">INVOICE NO:</span>
              <input className="inv-details-value" value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} style={{ width: 80 }} />
            </div>
            <div className="inv-details-row">
              <span className="inv-details-label">DATE:</span>
              <input type="date" className="inv-details-value" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} style={{ width: 100, fontSize: 9 }} />
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div style={{ overflowX: 'auto' }}>
          <table className="inv-table">
            <thead>
              <tr>
                <th className="col-sno"><input value={snoLabel} onChange={e => setSnoLabel(e.target.value)} /></th>
                <th style={{ textAlign: 'left', paddingLeft: 8 }}>DESCRIPTION</th>
                <th className="col-qty"><input value={qtyLabel} onChange={e => setQtyLabel(e.target.value)} /></th>
                <th className="col-rate"><input value={rateLabel} onChange={e => setRateLabel(e.target.value)} /></th>
                <th className="col-amt"><input value={amtLabel} onChange={e => setAmtLabel(e.target.value)} style={{ textAlign: 'right', color: 'white' }} /></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id}>
                  <td style={{ textAlign: 'center', color: '#cbd5e1', fontWeight: 800 }}>{i + 1}</td>
                  <td style={{ paddingLeft: 8 }}><input style={{ fontWeight: 700, color: '#334155' }} value={row.description} onChange={e => updateRow(row.id, 'description', e.target.value)} /></td>
                  <td style={{ textAlign: 'center' }}><input style={{ textAlign: 'center' }} value={row.quantity} onChange={e => updateRow(row.id, 'quantity', e.target.value)} /></td>
                  <td style={{ textAlign: 'center' }}><input style={{ textAlign: 'center', fontWeight: 700, color: '#2563eb' }} value={row.rate} onChange={e => updateRow(row.id, 'rate', e.target.value)} /></td>
                  <td className="td-amt">₹{((Number(row.quantity) || 0) * (Number(row.rate) || 0)).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="add-item-btn no-print" onClick={() => setRows([...rows, { id: Date.now(), description: '', quantity: '', rate: '' }])}>
            <Plus size={13} /> ADD LINE ITEM
          </button>
        </div>

        {/* TOTALS */}
        <div className="totals-section">
          <div className="grand-total-row">
            <span className="gt-label">Grand Total</span>
            <span className="gt-value">₹{totalAmount.toLocaleString()}</span>
          </div>
          <div className="advance-box">
            <input className="adv-label-input" value={advanceLabel} onChange={e => setAdvanceLabel(e.target.value)} />
            <div className="adv-value-wrap">
              <span style={{ color: '#10b981', fontSize: 10 }}>₹</span>
              <input className="adv-value-input" value={advanceInput} onChange={e => setAdvanceInput(e.target.value)} />
            </div>
          </div>
          <div className="balance-box">
            <span className="bal-label" style={{ color: 'rgba(255,255,255,0.5)' }}>Balance Due</span>
            <span className="bal-val">₹{balance.toLocaleString()}</span>
          </div>
        </div>

        {/* FOOTER AREA */}
        <div className="inv-footer">
          <div className="footer-top">
            <div style={{ flex: 1 }}>
              <p className="bank-label"><Landmark size={10} /> Bank Info</p>
              <input className="bank-input bank-name" value={bankName} onChange={e => setBankName(e.target.value)} />
              <input className="bank-input" style={{ fontWeight: 700, color: '#64748b' }} value={accName} onChange={e => setAccName(e.target.value)} />
              <input className="bank-input" style={{ color: '#94a3b8', fontFamily: 'monospace' }} value={accNo} onChange={e => setAccNo(e.target.value)} />
            </div>
            <div className="qr-col">
              <div className="qr-box no-print" onClick={() => qrRef.current?.click()}>
                {qrCode ? <img src={qrCode} alt="QR" /> : <><QrCode size={16} color="#cbd5e1" /><span style={{ fontSize: 6, color: '#94a3b8', fontWeight: 800 }}>UPI SCAN</span></>}
                <input type="file" ref={qrRef} hidden accept="image/*" onChange={e => handleImage(e, setQrCode)} />
              </div>
              {qrCode && <div className="qr-box print-show" style={{ display: 'none' }}><img src={qrCode} alt="QR" /></div>}
              <div className="thanks-text">THANK YOU FOR CHOOSING {companyName}</div>
            </div>
          </div>
          <p className="footer-note" style={{ textAlign: 'center' }}>*Please verify drawings and dimensions before execution.</p>
        </div>

        {/* ACTIONS */}
        <div className="action-bar no-print">
          <div className="action-row">
            <button className="btn btn-print" onClick={() => window.print()}><Download size={16} /> PRINT PDF</button>
            <button className="btn btn-share" onClick={onShare}><Share2 size={16} /> SHARE</button>
          </div>
          <button className="btn btn-reset" onClick={handleReset}><RotateCcw size={16} /> RESET</button>
        </div>
      </div>
      <p className="footer-brand no-print">Uniq Designs AI Terminal</p>
    </div>
  );
};

export default PaymentTracker;
