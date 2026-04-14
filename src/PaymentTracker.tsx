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
  }, [logo, qrCode, invoiceLabel, advanceLabel, snoLabel, qtyLabel, rateLabel, amtLabel,
    companyName, engineerName, address, clientName, invoiceNo, invoiceDate,
    advanceInput, rows, bankName, accName, accNo]);

  const logoRef = useRef<HTMLInputElement>(null);
  const qrRef = useRef<HTMLInputElement>(null);

  const handleReset = () => {
    if (window.confirm('Invoice data reset panna ok-va?')) {
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
      row.id === id
        ? { ...row, [field]: (field === 'quantity' || field === 'rate') ? (value === '' ? '' : parseFloat(value) || '') : value }
        : row
    ));
  }, []);

  const totalAmount = useMemo(() =>
    rows.reduce((s, r) => s + ((Number(r.quantity) || 0) * (Number(r.rate) || 0)), 0),
    [rows]
  );
  const balance = totalAmount - (Number(advanceInput) || 0);

  const onShare = async () => {
    const text = `*Invoice: ${companyName}*\nInvoice No: ${invoiceNo}\nTotal: ₹${totalAmount.toLocaleString()}\nAdvance: ₹${Number(advanceInput).toLocaleString()}\nBalance Due: ₹${balance.toLocaleString()}`;
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
    <div id="app-root">
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { width: 100%; overflow-x: hidden; font-family: 'Segoe UI', Arial, sans-serif; }

        /* ── SCREEN ── */
        #app-root { background: #e2e8f0; min-height: 100vh; padding-bottom: 32px; }
        .screen-card { width: 100%; max-width: 480px; margin: 0 auto; background: #fff; box-shadow: 0 8px 40px rgba(0,0,0,0.13); }
        @media (min-width: 500px) {
          #app-root { padding: 24px 0 48px; }
          .screen-card { border-radius: 18px; overflow: hidden; }
        }

        .inv-top-band {
          background: #ffffff;
          padding: 18px 18px 14px;
          display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;
        }
        .inv-top-left { flex: 1; min-width: 0; }
        .logo-btn {
          width: 88px; height: 52px; background: #f8fafc;
          border: 2px dashed #e2e8f0; border-radius: 10px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          cursor: pointer; margin-bottom: 10px; overflow: hidden;
        }
        .logo-btn img { width: 100%; height: 100%; object-fit: contain; padding: 4px; }
        .co-name { font-size: 20px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 0.04em; background: transparent; border: none; outline: none; width: 100%; display: block; line-height: 1.15; }
        .co-sub { font-size: 9.5px; font-weight: 600; color: #64748b; background: transparent; border: none; outline: none; width: 100%; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
        
        .inv-right-block { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
        .inv-label-input { font-size: 14px; font-weight: 900; color: #0f172a; letter-spacing: 0.1em; text-transform: uppercase; background: transparent; border: none; outline: none; text-align: right; width: 100px; }
        .logo-box-right {
          width: 120px; height: 65px; background: #f8fafc;
          border: 1.5px solid #e2e8f0; border-radius: 8px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          cursor: pointer; overflow: hidden; position: relative;
        }
        .logo-box-right img { width: 100%; height: 100%; object-fit: contain; padding: 2px; }

        .bill-row { display: grid; grid-template-columns: 1fr 1fr; border-top: 1.5px solid #0f172a; border-bottom: 2px solid #0f172a; }
        .bill-to-cell { padding: 10px 14px; border-right: 2px solid #0f172a; background: #f8fafc; }
        .bill-details-cell { padding: 10px 14px; }
        .cell-micro { font-size: 8.5px; font-weight: 900; color: #2563eb; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 5px; }
        .client-inp { font-size: 14px; font-weight: 800; color: #0f172a; background: transparent; border: none; outline: none; width: 100%; }
        .det-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
        .det-lbl { font-size: 8.5px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
        .det-val { font-size: 10px; font-weight: 900; color: #0f172a; background: transparent; border: none; outline: none; text-align: right; }

        .inv-table { width: 100%; border-collapse: collapse; }
        .inv-table thead tr { background: #0f172a; }
        .inv-table th { padding: 9px 5px; font-size: 8.5px; font-weight: 900; color: white; text-transform: uppercase; letter-spacing: 0.06em; }
        .inv-table th input { background: transparent; color: white; border: none; outline: none; font-weight: 900; font-size: 8.5px; text-transform: uppercase; width: 100%; text-align: center; }
        .inv-table tbody tr { border-bottom: 1px solid #f1f5f9; }
        .inv-table td { padding: 10px 5px; font-size: 11px; }
        .inv-table td input { border: none; outline: none; background: transparent; font-size: 11px; width: 100%; }
        .th-sno { width: 30px; text-align: center; }
        .th-desc { text-align: left; padding-left: 10px !important; }
        .th-amt { width: 68px; text-align: right; padding-right: 10px !important; }
        .td-amt { text-align: right; font-weight: 900; padding-right: 10px !important; color: #0f172a; }
        .add-row-btn { display: flex; align-items: center; gap: 6px; padding: 10px 14px; font-size: 9.5px; font-weight: 900; color: #2563eb; text-transform: uppercase; background: none; border: none; cursor: pointer; }

        .totals-wrap { padding: 14px 16px 12px; background: #f8fafc; }
        .grand-total-row { display: flex; justify-content: space-between; align-items: center; padding: 4px 4px 10px; }
        .gt-value { font-size: 20px; font-weight: 900; color: #0f172a; }
        .advance-pill { display: flex; justify-content: space-between; align-items: center; background: #ecfdf5; border: 1.5px solid #6ee7b7; border-radius: 12px; padding: 10px 16px; margin-bottom: 10px; }
        .adv-val-inp { font-size: 20px; font-weight: 900; color: #059669; background: transparent; border: none; outline: none; text-align: right; width: 90px; }
        .balance-card { background: #0f172a; border-radius: 14px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; }
        .bal-val { font-size: 30px; font-weight: 900; color: #fff; }

        .inv-footer { padding: 14px 16px 16px; border-top: 1.5px solid #e2e8f0; }
        .footer-cols { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 12px; }
        .bank-col { flex: 1; }
        .bank-nm { font-size: 12px; font-weight: 900; color: #0f172a; text-transform: uppercase; }
        .qr-col { display: flex; flex-direction: row; align-items: center; gap: 10px; }
        .qr-box { width: 60px; height: 60px; background: #f8fafc; border: 1.5px dashed #e2e8f0; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; }
        .qr-box img { width: 100%; height: 100%; object-fit: cover; }
        .thanks-text { font-size: 11px; font-weight: 900; color: #0f172a; text-transform: uppercase; width: 130px; line-height: 1.2; }

        .action-bar { padding: 12px 16px 20px; background: #f1f5f9; border-top: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 10px; }
        .action-row { display: flex; gap: 10px; }
        .btn { border: none; cursor: pointer; font-weight: 900; font-size: 11px; text-transform: uppercase; display: flex; align-items: center; justify-content: center; gap: 8px; border-radius: 13px; padding: 14px 10px; }
        .btn-print { flex: 1; background: #0f172a; color: white; }
        .btn-share { flex: 1; background: #10b981; color: white; }
        .btn-reset { width: 100%; background: white; color: #ef4444; border: 1.5px solid #fecaca !important; }

        @media print {
          @page { size: A4 portrait; margin: 0; }
          html, body { width: 210mm; height: 297mm; overflow: hidden; background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          #app-root { background: white !important; padding: 0 !important; }
          .screen-card { width: 100% !important; max-width: 100% !important; margin: 0 !important; border-radius: 0 !important; box-shadow: none !important; transform: scale(0.98); transform-origin: top center; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="screen-card">
        {/* HEADER */}
        <div className="inv-top-band">
          <div className="inv-top-left">
            <input className="co-name" value={companyName} onChange={e => setCompanyName(e.target.value)} />
            <input className="co-sub" value={engineerName} onChange={e => setEngineerName(e.target.value)} />
            <input className="co-sub" value={address} onChange={e => setAddress(e.target.value)} />
          </div>
          <div className="inv-right-block">
            <input className="inv-label-input" value={invoiceLabel} onChange={e => setInvoiceLabel(e.target.value)} />
            <div className="logo-box-right no-print" onClick={() => logoRef.current?.click()}>
              {logo ? <img src={logo} alt="Logo" /> : <><Camera size={14} color="#cbd5e1" /><span style={{ fontSize: 7, color: '#cbd5e1', fontWeight: 800 }}>LOGO</span></>}
              <input type="file" ref={logoRef} hidden accept="image/*" onChange={e => handleImage(e, setLogo)} />
            </div>
            {logo && <div className="logo-box-right print-show" style={{ display: 'none' }}><img src={logo} alt="Logo" /></div>}
          </div>
        </div>

        {/* BILL INFO */}
        <div className="bill-row">
          <div className="bill-to-cell">
            <p className="cell-micro">Bill To</p>
            <input className="client-inp" value={clientName} onChange={e => setClientName(e.target.value)} />
          </div>
          <div className="bill-details-cell">
            <div className="det-row">
              <span className="det-lbl">Invoice No:</span>
              <input className="det-val" value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} style={{ width: 80 }} />
            </div>
            <div className="det-row">
              <span className="det-lbl">Date:</span>
              <input type="date" className="det-val" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} style={{ width: 100, fontSize: 9 }} />
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div style={{ overflowX: 'auto' }}>
          <table className="inv-table">
            <thead>
              <tr>
                <th className="th-sno"><input value={snoLabel} onChange={e => setSnoLabel(e.target.value)} /></th>
                <th className="th-desc">DESCRIPTION</th>
                <th className="th-qty"><input value={qtyLabel} onChange={e => setQtyLabel(e.target.value)} /></th>
                <th className="th-rate"><input value={rateLabel} onChange={e => setRateLabel(e.target.value)} /></th>
                <th className="th-amt"><input value={amtLabel} onChange={e => setAmtLabel(e.target.value)} style={{ textAlign: 'right', color: 'white' }} /></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id}>
                  <td style={{ textAlign: 'center', color: '#cbd5e1', fontWeight: 800 }}>{i + 1}</td>
                  <td className="td-desc"><input style={{ fontWeight: 700, color: '#334155' }} value={row.description} onChange={e => updateRow(row.id, 'description', e.target.value)} /></td>
                  <td style={{ textAlign: 'center' }}><input style={{ textAlign: 'center' }} value={row.quantity} onChange={e => updateRow(row.id, 'quantity', e.target.value)} /></td>
                  <td style={{ textAlign: 'center' }}><input style={{ textAlign: 'center', fontWeight: 700, color: '#2563eb' }} value={row.rate} onChange={e => updateRow(row.id, 'rate', e.target.value)} /></td>
                  <td className="td-amt">₹{((Number(row.quantity) || 0) * (Number(row.rate) || 0)).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="add-row-btn no-print" onClick={() => setRows([...rows, { id: Date.now(), description: '', quantity: '', rate: '' }])}>
            <Plus size={13} /> Add Line Item
          </button>
        </div>

        {/* TOTALS */}
        <div className="totals-wrap">
          <div className="grand-total-row">
            <span className="total-line-lbl">Grand Total</span>
            <span className="gt-value">₹{totalAmount.toLocaleString()}</span>
          </div>
          <div className="advance-pill">
            <input className="adv-lbl-inp" value={advanceLabel} onChange={e => setAdvanceLabel(e.target.value)} />
            <div className="adv-val-wrap">
              <span className="adv-symbol">₹</span>
              <input className="adv-val-inp" value={advanceInput} onChange={e => setAdvanceInput(e.target.value)} />
            </div>
          </div>
          <div className="balance-card">
            <span className="bal-lbl" style={{ color: 'rgba(255,255,255,0.5)' }}>Balance Due</span>
            <span className="bal-val">₹{balance.toLocaleString()}</span>
          </div>
        </div>

        {/* FOOTER */}
        <div className="inv-footer">
          <div className="footer-cols">
            <div className="bank-col">
              <p className="bank-micro"><Landmark size={9} /> Bank Info</p>
              <input className="bank-inp bank-nm" value={bankName} onChange={e => setBankName(e.target.value)} />
              <input className="bank-inp bank-an" value={accName} onChange={e => setAccName(e.target.value)} />
              <input className="bank-inp bank-no" value={accNo} onChange={e => setAccNo(e.target.value)} />
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

        {/* ACTION BUTTONS */}
        <div className="action-bar no-print">
          <div className="action-row">
            <button className="btn btn-print" onClick={() => window.print()}><Download size={15} /> Print PDF</button>
            <button className="btn btn-share" onClick={onShare}><Share2 size={15} /> Share</button>
          </div>
          <button className="btn btn-reset" onClick={handleReset}><RotateCcw size={15} /> Reset</button>
        </div>
      </div>
    </div>
  );
};

export default PaymentTracker;
