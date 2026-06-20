/* ===== Utility Functions ===== */
function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}
function getDate() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}
function numberToWords(num) {
  if (!num || isNaN(num)) return '';
  const a = ['','One ','Two ','Three ','Four ','Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
  const b = ['','','Twenty ','Thirty ','Forty ','Fifty ','Sixty ','Seventy ','Eighty ','Ninety '];
  const units = ['','Thousand ','Lakh ','Crore '];
  let n = Math.round(num);
  if (n === 0) return 'Zero';
  let words = '';
  let unitIdx = 0;
  while (n > 0) {
    let chunk = unitIdx === 0 ? n % 1000 : (unitIdx === 1 ? n % 100 : n % 10);
    if (unitIdx >= 2) {
      chunk = n % 100;
      n = Math.floor(n / 100);
    } else {
      n = Math.floor(n / (unitIdx === 0 ? 1000 : 100));
    }
    if (chunk > 0) {
      let chunkWords = '';
      if (chunk >= 100) { chunkWords += a[Math.floor(chunk/100)] + 'Hundred '; chunk %= 100; }
      if (chunk >= 20) { chunkWords += b[Math.floor(chunk/10)]; chunk %= 10; }
      if (chunk > 0) chunkWords += a[chunk];
      words = chunkWords + units[unitIdx] + words;
    }
    unitIdx++;
  }
  return words.trim() + ' Only';
}

/* ===== Form Data ===== */
function getFormData() {
  const fuelRate = parseFloat(getVal('fuelRate')) || 0;
  const fuelQty = parseFloat(getVal('fuelQty')) || 0;
  const totalAmount = parseFloat(getVal('totalAmount')) || 0;
  const currency = getVal('currency') || '₹';
  const logoImg = document.getElementById('logoPreview').querySelector('img');
  return {
    stationName: getVal('stationName') || 'Fuel Station',
    stationAddress: getVal('stationAddress') || '',
    telNo: getVal('telNo'),
    fccId: getVal('fccId'),
    fipNo: getVal('fipNo'),
    nozzleNo: getVal('nozzleNo'),
    logo: logoImg ? logoImg.src : '',
    invoiceNumber: getVal('invoiceNumber') || 'INV-001',
    paymentMethod: getVal('paymentMethod') || 'Cash',
    taxType: getVal('taxType') || 'None',
    gstTin: getVal('gstTin'),
    cstTin: getVal('cstTin'),
    txnNo: getVal('txnNo'),
    currency,
    fuelRate,
    fuelQty,
    totalAmount,
    billDate: getVal('billDate') ? formatDate(getVal('billDate')) : formatDate(getDate()),
    billTime: getVal('billTime') || '10:30',
    fuelType: getVal('fuelType') || 'Petrol',
    customerName: getVal('customerName') || 'Customer',
    vehicleNumber: getVal('vehicleNumber') || '',
    vehicleType: getVal('vehicleType') || 'Car',
    amountWords: numberToWords(totalAmount),
    fileName: getVal('downloadFileName') || 'Fuel-Bill-Receipt'
  };
}

/* ===== Template Renderers ===== */
function renderTemplate1(d) {
  return `<div class="bill bill-t1">
    <div class="bill-inner">
      <div class="bill-header">
        ${d.logo ? `<img src="${d.logo}" style="height:40px;margin-bottom:6px">` : ''}
        <div class="bill-title">Fuel Station Receipt</div>
        <div class="bill-subtitle">${d.stationAddress}</div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:8px">
        <span>Tel: ${d.telNo}</span>
        <span>Date: ${d.billDate}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:10px">
        <span>FCC ID: ${d.fccId}</span>
        <span>FIP No: ${d.fipNo}</span>
      </div>
      <table class="bill-table">
        <thead><tr>
          <th>Particulars</th><th>Qty (L)</th><th>Rate</th><th>Amount</th>
        </tr></thead>
        <tbody>
          <tr>
            <td>${d.fuelType}</td>
            <td>${d.fuelQty.toFixed(2)}</td>
            <td>${d.currency}${d.fuelRate.toFixed(2)}</td>
            <td>${d.currency}${d.totalAmount.toFixed(2)}</td>
          </tr>
          <tr class="bill-total-row">
            <td colspan="3"><strong>Total</strong></td>
            <td><strong>${d.currency}${d.totalAmount.toFixed(2)}</strong></td>
          </tr>
        </tbody>
      </table>
      ${d.amountWords ? `<div class="bill-amount-words">Amount (in words): ${d.amountWords}</div>` : ''}
      <div style="margin-top:8px;font-size:12px">
        <div class="bill-row"><span class="bill-row-label">Invoice:</span><span class="bill-row-value">${d.invoiceNumber}</span></div>
        <div class="bill-row"><span class="bill-row-label">Customer:</span><span class="bill-row-value">${d.customerName}</span></div>
        <div class="bill-row"><span class="bill-row-label">Vehicle:</span><span class="bill-row-value">${d.vehicleNumber} (${d.vehicleType})</span></div>
        <div class="bill-row"><span class="bill-row-label">Payment:</span><span class="bill-row-value">${d.paymentMethod}</span></div>
        <div class="bill-row"><span class="bill-row-label">Nozzle:</span><span class="bill-row-value">${d.nozzleNo}</span></div>
        ${d.txnNo ? `<div class="bill-row"><span class="bill-row-label">TXN:</span><span class="bill-row-value">${d.txnNo}</span></div>` : ''}
      </div>
      ${d.taxType !== 'None' ? `<div style="margin-top:8px;font-size:11px;color:#475569">
        ${d.taxType === 'GST' ? `GST TIN: ${d.gstTin}` : `CST TIN: ${d.cstTin}`}
      </div>` : ''}
      <div class="bill-signature">
        <div><div class="line"></div>Customer Signature</div>
        <div><div class="line"></div>Station Stamp</div>
      </div>
      <div class="bill-footer">Thank you for visiting! &middot; Fuel Bill Generated</div>
    </div>
  </div>`;
}

function renderTemplate2(d) {
  return `<div class="bill bill-t2">
    <div class="bill-inner">
      <div class="bill-header">
        ${d.logo ? `<img src="${d.logo}" style="height:36px;margin-bottom:4px">` : ''}
        <div class="bill-title">${d.stationName}</div>
        <div style="font-size:12px;color:#64748b;margin-top:2px">${d.stationAddress}</div>
      </div>
      <div class="bill-divider"></div>
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:8px">
        <div><span style="color:#94a3b8">Date:</span> ${d.billDate}</div>
        <div><span style="color:#94a3b8">Time:</span> ${d.billTime}</div>
        <div><span style="color:#94a3b8">Invoice:</span> ${d.invoiceNumber}</div>
      </div>
      <div class="bill-section-title">Fuel Details</div>
      <div class="bill-row"><span class="bill-row-label">Fuel Type</span><span class="bill-row-value">${d.fuelType}</span></div>
      <div class="bill-row"><span class="bill-row-label">Quantity</span><span class="bill-row-value">${d.fuelQty.toFixed(2)} Litres</span></div>
      <div class="bill-row"><span class="bill-row-label">Rate per Litre</span><span class="bill-row-value">${d.currency}${d.fuelRate.toFixed(2)}</span></div>
      <div class="bill-divider"></div>
      <div class="bill-row" style="font-size:15px"><span class="bill-row-label"><strong>Total Amount</strong></span><span class="bill-row-value"><strong>${d.currency}${d.totalAmount.toFixed(2)}</strong></span></div>
      <div class="bill-divider"></div>
      <div class="bill-section-title">Customer</div>
      <div class="bill-row"><span class="bill-row-label">Name</span><span class="bill-row-value">${d.customerName}</span></div>
      <div class="bill-row"><span class="bill-row-label">Vehicle</span><span class="bill-row-value">${d.vehicleNumber} (${d.vehicleType})</span></div>
      <div class="bill-row"><span class="bill-row-label">Payment</span><span class="bill-row-value">${d.paymentMethod}</span></div>
      <div class="bill-row"><span class="bill-row-label">Nozzle</span><span class="bill-row-value">${d.nozzleNo}</span></div>
      <div class="bill-footer">${d.amountWords}</div>
    </div>
  </div>`;
}

function renderTemplate3(d) {
  return `<div class="bill bill-t3">
    <div class="bill-inner">
      <div class="bill-header">
        <div>
          <div class="bill-title">${d.stationName}</div>
          <div class="bill-subtitle">${d.stationAddress}</div>
          <div style="font-size:11px;margin-top:4px">Tel: ${d.telNo} &middot; FCC: ${d.fccId}</div>
        </div>
        <div style="text-align:right;font-size:12px">
          ${d.logo ? `<img src="${d.logo}" style="height:40px;margin-bottom:4px"><br>` : ''}
          <div>${d.billDate}</div>
          <div>${d.billTime}</div>
        </div>
      </div>
      <div class="bill-body">
        <div class="bill-section-title">Tax Invoice</div>
        <table class="bill-table">
          <thead><tr><th>#</th><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
          <tbody>
            <tr><td>1</td><td>${d.fuelType} - ${d.nozzleNo ? 'Nozzle '+d.nozzleNo : ''}</td><td>${d.fuelQty.toFixed(2)} L</td><td>${d.currency}${d.fuelRate.toFixed(2)}</td><td>${d.currency}${d.totalAmount.toFixed(2)}</td></tr>
            <tr class="bill-total-row"><td colspan="4"><strong>Total</strong></td><td><strong>${d.currency}${d.totalAmount.toFixed(2)}</strong></td></tr>
          </tbody>
        </table>
        ${d.amountWords ? `<div class="bill-amount-words">${d.amountWords}</div>` : ''}
        <div style="margin-top:10px;font-size:12px">
          <div class="bill-row"><span class="bill-row-label">Invoice No</span><span class="bill-row-value">${d.invoiceNumber}</span></div>
          <div class="bill-row"><span class="bill-row-label">Customer</span><span class="bill-row-value">${d.customerName}</span></div>
          <div class="bill-row"><span class="bill-row-label">Vehicle</span><span class="bill-row-value">${d.vehicleNumber} (${d.vehicleType})</span></div>
          <div class="bill-row"><span class="bill-row-label">Payment</span><span class="bill-row-value">${d.paymentMethod}</span></div>
          ${d.txnNo ? `<div class="bill-row"><span class="bill-row-label">TXN No</span><span class="bill-row-value">${d.txnNo}</span></div>` : ''}
        </div>
        ${d.taxType === 'GST' ? `<div style="margin-top:8px;padding-top:8px;border-top:1px solid #e2e8f0;font-size:11px;color:#475569">
          <div>GST TIN: ${d.gstTin}</div>
          <div class="gst-breakup">CGST: ${d.currency}${(d.totalAmount*0.09).toFixed(2)} &middot; SGST: ${d.currency}${(d.totalAmount*0.09).toFixed(2)} &middot; IGST: ${d.currency}${(d.totalAmount*0.18).toFixed(2)}</div>
        </div>` : ''}
        ${d.taxType === 'VAT' ? `<div style="margin-top:8px;font-size:11px;color:#475569">CST TIN: ${d.cstTin} &middot; VAT @ 5%: ${d.currency}${(d.totalAmount*0.05).toFixed(2)}</div>` : ''}
        <div class="bill-signature">
          <div><div class="line"></div>Authorised Signatory</div>
          <div><div class="line"></div>Customer</div>
        </div>
      </div>
      <div class="bill-footer">${d.fipNo ? 'FIP: '+d.fipNo+' &middot; ' : ''}This is a computer-generated invoice</div>
    </div>
  </div>`;
}

function renderTemplate4(d) {
  return `<div class="bill bill-t4">
    <div class="bill-inner">
      <div class="bill-header">
        <div>
          <div class="bill-title">${d.stationName}</div>
          <div style="font-size:12px;color:#475569;margin-top:4px">${d.stationAddress}</div>
          <div style="font-size:11px;color:#64748b;margin-top:2px">Tel: ${d.telNo} &middot; FIP: ${d.fipNo}</div>
        </div>
        <div style="text-align:right">
          <div class="tax-badge">TAX INVOICE</div>
          ${d.logo ? `<img src="${d.logo}" style="height:36px;margin-top:4px">` : ''}
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:11px;color:#64748b;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid #e2e8f0">
        <span>Invoice: <strong>${d.invoiceNumber}</strong></span>
        <span>Date: <strong>${d.billDate}</strong></span>
        <span>Time: <strong>${d.billTime}</strong></span>
      </div>
      <table class="bill-table">
        <thead><tr><th>HSN/SAC</th><th>Description</th><th>Qty</th><th>Rate</th><th>Tax</th><th>Amount</th></tr></thead>
        <tbody>
          <tr>
            <td>2710</td>
            <td>${d.fuelType}</td>
            <td>${d.fuelQty.toFixed(2)} L</td>
            <td>${d.currency}${d.fuelRate.toFixed(2)}</td>
            <td>18%</td>
            <td>${d.currency}${d.totalAmount.toFixed(2)}</td>
          </tr>
          <tr><td colspan="5" style="text-align:right;font-weight:600">Total</td><td style="font-weight:700">${d.currency}${d.totalAmount.toFixed(2)}</td></tr>
        </tbody>
      </table>
      <div style="margin-top:10px;font-size:12px">
        <div class="bill-row"><span class="bill-row-label">Customer Name</span><span class="bill-row-value">${d.customerName}</span></div>
        <div class="bill-row"><span class="bill-row-label">Vehicle No</span><span class="bill-row-value">${d.vehicleNumber}</span></div>
        <div class="bill-row"><span class="bill-row-label">Vehicle Type</span><span class="bill-row-value">${d.vehicleType}</span></div>
        <div class="bill-row"><span class="bill-row-label">Payment Mode</span><span class="bill-row-value">${d.paymentMethod}</span></div>
        <div class="bill-row"><span class="bill-row-label">TXN No</span><span class="bill-row-value">${d.txnNo}</span></div>
      </div>
      ${d.taxType === 'GST' ? `<div style="margin-top:8px;padding:8px;background:#ecfdf5;border-radius:4px;font-size:11px">
        <strong>GST Breakup:</strong><br>
        GST TIN: ${d.gstTin}<br>
        Taxable: ${d.currency}${(d.totalAmount/1.18).toFixed(2)} &middot; CGST @9%: ${d.currency}${(d.totalAmount/1.18*0.09).toFixed(2)}<br>
        SGST @9%: ${d.currency}${(d.totalAmount/1.18*0.09).toFixed(2)} &middot; Total GST: ${d.currency}${(d.totalAmount - d.totalAmount/1.18).toFixed(2)}
      </div>` : ''}
      ${d.amountWords ? `<div class="bill-amount-words">Amount in Words: ${d.amountWords}</div>` : ''}
      <div class="bill-signature">
        <div><div class="line"></div>For ${d.stationName}</div>
        <div><div class="line"></div>Receiver's Signature</div>
      </div>
      <div class="bill-footer">Subject to Mumbai jurisdiction &middot; ${d.cstTin ? 'CST: '+d.cstTin : ''}</div>
    </div>
  </div>`;
}

function renderTemplate5(d) {
  return `<div class="bill bill-t5">
    <div class="bill-inner">
      <div class="bill-header" style="text-align:center">
        ${d.logo ? `<img src="${d.logo}" style="height:32px;margin-bottom:2px">` : ''}
        <div class="bill-title">${d.stationName}</div>
        <div style="font-size:10px;color:#64748b">${d.stationAddress}</div>
      </div>
      <div class="bill-divider-dashed"></div>
      <div style="font-size:11px;text-align:center;color:#64748b">
        ${d.billDate} &middot; ${d.billTime} &middot; #${d.invoiceNumber}
      </div>
      <div class="bill-divider-dashed"></div>
      ${d.fccId ? `<div style="font-size:10px;text-align:center;color:#94a3b8">FCC: ${d.fccId} ${d.fipNo ? ' &middot; FIP: '+d.fipNo : ''}</div>` : ''}
      <div style="font-size:12px;margin:8px 0">
        <div class="bill-row"><span>Fuel</span><span>${d.fuelType}</span></div>
        <div class="bill-row"><span>Nozzle</span><span>${d.nozzleNo}</span></div>
        <div class="bill-row"><span>Qty</span><span>${d.fuelQty.toFixed(2)} L ${d.currency}${d.fuelRate.toFixed(2)}/L</span></div>
        <div class="bill-row"><span>Customer</span><span>${d.customerName}</span></div>
        <div class="bill-row"><span>Vehicle</span><span>${d.vehicleNumber}</span></div>
      </div>
      <div class="bill-divider-dashed"></div>
      <div class="bill-total">Total: ${d.currency}${d.totalAmount.toFixed(2)}</div>
      <div class="bill-divider-dashed"></div>
      <div style="font-size:10px;text-align:center;color:#94a3b8;margin-top:4px">
        ${d.paymentMethod} &middot; ${d.txnNo ? 'TXN: '+d.txnNo : ''}
      </div>
      <div class="bill-footer" style="margin-top:6px">Thank You! Visit Again</div>
    </div>
  </div>`;
}

function renderTemplate6(d) {
  return `<div class="bill bill-t6">
    <div class="bill-inner">
      <div class="bill-header" style="display:flex;align-items:center;gap:12px">
        ${d.logo ? `<img src="${d.logo}" style="height:36px;border-radius:6px">` : ''}
        <div>
          <div class="bill-title">${d.stationName}</div>
          <div class="bill-subtitle">${d.stationAddress}</div>
        </div>
        <div style="margin-left:auto;text-align:right">
          <div style="font-size:11px">${d.billDate}</div>
          <div style="font-size:10px;color:#fed7aa">${d.billTime}</div>
        </div>
      </div>
      <div class="bill-body">
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:8px">
          <span style="color:#64748b"><strong>Invoice:</strong> ${d.invoiceNumber}</span>
          <span style="color:#64748b"><strong>Payment:</strong> ${d.paymentMethod}</span>
        </div>
        <div class="bill-section-title">Fuel Transaction</div>
        <table class="bill-table">
          <thead><tr><th>Fuel</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
          <tbody>
            <tr><td>${d.fuelType}</td><td>${d.fuelQty.toFixed(2)} L</td><td>${d.currency}${d.fuelRate.toFixed(2)}</td><td>${d.currency}${d.totalAmount.toFixed(2)}</td></tr>
          </tbody>
        </table>
        <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:700;padding:6px 8px;margin-top:4px;background:#fff7ed;border-radius:6px">
          <span>Total Due</span><span>${d.currency}${d.totalAmount.toFixed(2)}</span>
        </div>
        <div style="margin-top:8px;font-size:12px">
          <div class="bill-row"><span class="bill-row-label">👤 Customer</span><span class="bill-row-value">${d.customerName}</span></div>
          <div class="bill-row"><span class="bill-row-label">🚗 Vehicle</span><span class="bill-row-value">${d.vehicleNumber}</span></div>
          <div class="bill-row"><span class="bill-row-label">⛽ Nozzle</span><span class="bill-row-value">${d.nozzleNo}</span></div>
          ${d.txnNo ? `<div class="bill-row"><span class="bill-row-label">🔖 TXN</span><span class="bill-row-value">${d.txnNo}</span></div>` : ''}
        </div>
        ${d.taxType !== 'None' ? `<div style="margin-top:6px;font-size:11px;padding:6px;background:#f1f5f9;border-radius:4px;color:#475569">
          ${d.taxType === 'GST' ? 'GST: '+d.gstTin : 'CST: '+d.cstTin}
        </div>` : ''}
        ${d.amountWords ? `<div class="bill-amount-words" style="font-size:11px">${d.amountWords}</div>` : ''}
      </div>
      <div class="bill-footer" style="text-align:center;padding:8px;font-weight:500">
        ⛽ Drive Safe &middot; Thank You!
      </div>
    </div>
  </div>`;
}

/* ===== Render Dispatcher ===== */
function renderBill(templateNum, data) {
  const renderers = {
    1: renderTemplate1,
    2: renderTemplate2,
    3: renderTemplate3,
    4: renderTemplate4,
    5: renderTemplate5,
    6: renderTemplate6
  };
  const fn = renderers[templateNum] || renderTemplate1;
  return fn(data);
}

/* ===== App State ===== */
let currentTemplate = 1;

/* ===== DOM References ===== */
const billPreview = document.getElementById('billPreview');
const previewContainer = document.getElementById('previewContainer');
const templateGrid = document.getElementById('templateGrid');
const downloadBtn = document.getElementById('downloadBtn');
const logoInput = document.getElementById('logoInput');
const logoPreview = document.getElementById('logoPreview');
const uploadLogoBtn = document.getElementById('uploadLogoBtn');
const clearLogoBtn = document.getElementById('clearLogoBtn');
const previewModal = document.getElementById('previewModal');
const modalBody = document.getElementById('modalBody');
const closeModalBtn = document.getElementById('closeModalBtn');
const expandPreviewBtn = document.getElementById('expandPreviewBtn');

/* ===== Update Preview ===== */
function updatePreview() {
  const data = getFormData();
  const html = renderBill(currentTemplate, data);
  billPreview.innerHTML = html;
  previewContainer.querySelector('.preview-watermark').style.display = 'flex';
}

/* ===== Template Switching ===== */
templateGrid.addEventListener('click', function(e) {
  const card = e.target.closest('.template-card');
  if (!card) return;
  document.querySelectorAll('.template-card').forEach(c => c.classList.remove('active'));
  card.classList.add('active');
  currentTemplate = parseInt(card.dataset.template);
  updatePreview();
});

/* ===== Logo Upload ===== */
uploadLogoBtn.addEventListener('click', () => logoInput.click());
clearLogoBtn.addEventListener('click', () => {
  logoInput.value = '';
  const existing = logoPreview.querySelector('img');
  if (existing) existing.remove();
  logoPreview.innerHTML = `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg><span>Upload Logo</span>`;
  updatePreview();
});
logoInput.addEventListener('change', function() {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    logoPreview.innerHTML = `<img src="${e.target.result}" alt="Logo">`;
    updatePreview();
  };
  reader.readAsDataURL(file);
});

/* ===== Form Binding ===== */
document.querySelectorAll('.form-input').forEach(el => {
  el.addEventListener('input', updatePreview);
  el.addEventListener('change', updatePreview);
});

/* ===== PDF Download ===== */
downloadBtn.addEventListener('click', function() {
  const btn = this;
  const origContent = btn.innerHTML;
  btn.innerHTML = '<span class="spinner"></span> Generating...';
  btn.disabled = true;

  const data = getFormData();

  // Hide watermark for PDF
  const watermark = previewContainer.querySelector('.preview-watermark');
  if (watermark) watermark.style.display = 'none';

  // Clone the preview content for clean PDF
  const clone = billPreview.cloneNode(true);
  const wrapper = document.createElement('div');
  wrapper.appendChild(clone);
  wrapper.style.padding = '0';
  wrapper.style.background = '#fff';
  wrapper.style.width = '595px'; // A4 width at 72dpi

  const opt = {
    margin:        [10, 10, 10, 10],
    filename:      data.fileName + '.pdf',
    image:         { type: 'jpeg', quality: 0.98 },
    html2canvas:   { scale: 2, useCORS: true, allowTaint: true, letterRendering: true },
    jsPDF:         { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(wrapper).save().then(function() {
    btn.innerHTML = origContent;
    btn.disabled = false;
    if (watermark) watermark.style.display = 'flex';
  }).catch(function(err) {
    console.error('PDF Error:', err);
    btn.innerHTML = origContent;
    btn.disabled = false;
    if (watermark) watermark.style.display = 'flex';
    alert('Failed to generate PDF. Please try again.');
  });
});

/* ===== Fullscreen Preview ===== */
expandPreviewBtn.addEventListener('click', function() {
  const data = getFormData();
  const html = renderBill(currentTemplate, data);
  modalBody.innerHTML = `<div class="bill-preview" style="padding:0;min-height:auto">${html}</div>`;
  previewModal.classList.add('open');
});
closeModalBtn.addEventListener('click', () => previewModal.classList.remove('open'));
previewModal.addEventListener('click', function(e) {
  if (e.target === this) this.classList.remove('open');
});
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') previewModal.classList.remove('open');
});

/* ===== Init ===== */
document.getElementById('billDate').value = getDate();
updatePreview();
