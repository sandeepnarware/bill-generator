/* ===== Maintenance (Vehicle Service) Bill Generator ===== */

/* ---- Utilities ---- */
function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}
function todayISO() {
  return new Date().toISOString().split('T')[0];
}
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function numberToWords(num) {
  if (!num || isNaN(num)) return '';
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty ', 'Thirty ', 'Forty ', 'Fifty ', 'Sixty ', 'Seventy ', 'Eighty ', 'Ninety '];
  const units = ['', 'Thousand ', 'Lakh ', 'Crore '];
  let n = Math.round(num);
  if (n === 0) return 'Zero Only';
  let words = '';
  let unitIdx = 0;
  while (n > 0) {
    let chunk = unitIdx === 0 ? n % 1000 : n % 100;
    n = Math.floor(n / (unitIdx === 0 ? 1000 : 100));
    if (chunk > 0) {
      let cw = '';
      if (chunk >= 100) { cw += a[Math.floor(chunk / 100)] + 'Hundred '; chunk %= 100; }
      if (chunk >= 20) { cw += b[Math.floor(chunk / 10)]; chunk %= 10; }
      if (chunk > 0) cw += a[chunk];
      words = cw + units[unitIdx] + words;
    }
    unitIdx++;
  }
  return words.trim() + ' Only';
}

/* ---- State: line items ---- */
let parts = [
  { desc: 'Engine Oil 5W-30 (4L)', qty: '1', rate: '2400', disc: '0', gst: '18' },
  { desc: 'Oil Filter', qty: '1', rate: '320', disc: '0', gst: '18' },
  { desc: 'Air Filter', qty: '1', rate: '450', disc: '10', gst: '18' }
];
let labour = [
  { desc: 'Periodic Service - Labour', rate: '1200', disc: '0', gst: '18' },
  { desc: 'Wheel Alignment & Balancing', rate: '800', disc: '0', gst: '18' }
];

/* ---- Calculations ---- */
function lineCalc(item, hasQty) {
  const qty = hasQty ? (parseFloat(item.qty) || 0) : 1;
  const rate = parseFloat(item.rate) || 0;
  const disc = parseFloat(item.disc) || 0;
  const gst = parseFloat(item.gst) || 0;
  const gross = qty * rate;
  const discAmt = gross * disc / 100;
  const taxable = gross - discAmt;
  const taxAmt = taxable * gst / 100;
  return { qty, rate, disc, gst, gross, discAmt, taxable, taxAmt, total: taxable + taxAmt };
}
function totals() {
  let gross = 0, discAmt = 0, taxable = 0, taxAmt = 0;
  parts.forEach(p => { const c = lineCalc(p, true); gross += c.gross; discAmt += c.discAmt; taxable += c.taxable; taxAmt += c.taxAmt; });
  labour.forEach(l => { const c = lineCalc(l, false); gross += c.gross; discAmt += c.discAmt; taxable += c.taxable; taxAmt += c.taxAmt; });
  return { gross, discAmt, taxable, taxAmt, grand: taxable + taxAmt };
}

/* ---- Form data ---- */
function getData() {
  const logoImg = document.getElementById('logoPreview').querySelector('img');
  return {
    workshopName: getVal('workshopName') || 'Service Centre',
    workshopAddress: getVal('workshopAddress') || '',
    workshopContact: getVal('workshopContact'),
    workshopGstin: getVal('workshopGstin'),
    docTitle: getVal('docTitle') || 'Tax Invoice',
    invoiceNo: getVal('invoiceNo') || 'INV-001',
    billDate: getVal('billDate') ? formatDate(getVal('billDate')) : formatDate(todayISO()),
    billingType: getVal('billingType') || 'Paid',
    logo: logoImg ? logoImg.src : '',
    custName: getVal('custName') || 'Customer',
    custContact: getVal('custContact'),
    vehicleModel: getVal('vehicleModel'),
    regNo: getVal('regNo'),
    vin: getVal('vin'),
    odometer: getVal('odometer'),
    insuranceCo: getVal('insuranceCo'),
    currency: getVal('currency') || '₹',
    taxType: getVal('taxType') || 'GST',
    terms: getVal('terms') || '',
    fileName: getVal('downloadFileName') || 'Maintenance-Bill'
  };
}

/* ---- Render: editable line-item rows ---- */
function partRow(p, i) {
  return `<div class="li-row li-row-part">
    <input class="form-input li-cell li-desc" data-li="part" data-index="${i}" data-field="desc" value="${esc(p.desc)}" placeholder="Part description">
    <input class="form-input li-cell li-num" type="number" step="1" min="0" data-li="part" data-index="${i}" data-field="qty" value="${esc(p.qty)}" placeholder="Qty">
    <input class="form-input li-cell li-num" type="number" step="0.01" min="0" data-li="part" data-index="${i}" data-field="rate" value="${esc(p.rate)}" placeholder="Rate">
    <input class="form-input li-cell li-num" type="number" step="1" min="0" max="100" data-li="part" data-index="${i}" data-field="disc" value="${esc(p.disc)}" placeholder="Disc%">
    <input class="form-input li-cell li-num" type="number" step="1" min="0" max="100" data-li="part" data-index="${i}" data-field="gst" value="${esc(p.gst)}" placeholder="GST%">
    <button type="button" class="li-remove" data-remove="part" data-index="${i}" title="Remove" aria-label="Remove row">&times;</button>
  </div>`;
}
function labourRow(l, i) {
  return `<div class="li-row li-row-labour">
    <input class="form-input li-cell li-desc" data-li="labour" data-index="${i}" data-field="desc" value="${esc(l.desc)}" placeholder="Job / labour description">
    <input class="form-input li-cell li-num" type="number" step="0.01" min="0" data-li="labour" data-index="${i}" data-field="rate" value="${esc(l.rate)}" placeholder="Rate">
    <input class="form-input li-cell li-num" type="number" step="1" min="0" max="100" data-li="labour" data-index="${i}" data-field="disc" value="${esc(l.disc)}" placeholder="Disc%">
    <input class="form-input li-cell li-num" type="number" step="1" min="0" max="100" data-li="labour" data-index="${i}" data-field="gst" value="${esc(l.gst)}" placeholder="GST%">
    <button type="button" class="li-remove" data-remove="labour" data-index="${i}" title="Remove" aria-label="Remove row">&times;</button>
  </div>`;
}
function renderRows() {
  document.getElementById('partsRows').innerHTML = parts.map(partRow).join('');
  document.getElementById('labourRows').innerHTML = labour.map(labourRow).join('');
}

/* ---- Render: bill preview ---- */
function money(cur, v) { return cur + (Number(v) || 0).toFixed(2); }

function renderBill(d) {
  const t = totals();
  const cur = d.currency;
  const addr = (d.workshopAddress || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  const partRows = parts.map((p, i) => {
    const c = lineCalc(p, true);
    return `<tr>
      <td>${i + 1}</td>
      <td class="m-left">${esc(p.desc)}</td>
      <td>${c.qty}</td>
      <td>${money(cur, c.rate)}</td>
      <td>${c.disc ? c.disc + '%' : '-'}</td>
      <td>${c.gst}%</td>
      <td>${money(cur, c.total)}</td>
    </tr>`;
  }).join('');

  const labourRows = labour.map((l, i) => {
    const c = lineCalc(l, false);
    return `<tr>
      <td>${i + 1}</td>
      <td class="m-left">${esc(l.desc)}</td>
      <td>${money(cur, c.rate)}</td>
      <td>${c.disc ? c.disc + '%' : '-'}</td>
      <td>${c.gst}%</td>
      <td>${money(cur, c.total)}</td>
    </tr>`;
  }).join('');

  let taxRows = '';
  if (d.taxType === 'GST') {
    taxRows = `<div class="m-trow"><span>CGST</span><span>${money(cur, t.taxAmt / 2)}</span></div>
      <div class="m-trow"><span>SGST</span><span>${money(cur, t.taxAmt / 2)}</span></div>`;
  } else {
    taxRows = `<div class="m-trow"><span>VAT</span><span>${money(cur, t.taxAmt)}</span></div>`;
  }

  const billingClass = 'm-badge-' + d.billingType.toLowerCase();

  return `<div class="mbill">
    <div class="mbill-head">
      <div class="mbill-head-left">
        ${d.logo ? `<img src="${d.logo}" class="mbill-logo" alt="logo">` : ''}
        <div>
          <div class="mbill-wname">${esc(d.workshopName)}</div>
          ${addr.map(l => `<div class="mbill-waddr">${esc(l)}</div>`).join('')}
          ${d.workshopContact ? `<div class="mbill-waddr">Tel: ${esc(d.workshopContact)}</div>` : ''}
          ${d.workshopGstin ? `<div class="mbill-waddr">GSTIN: ${esc(d.workshopGstin)}</div>` : ''}
        </div>
      </div>
      <div class="mbill-head-right">
        <div class="mbill-doctitle">${esc(d.docTitle)}</div>
        <span class="m-badge ${billingClass}">${esc(d.billingType)}</span>
        <div class="mbill-meta">No: <strong>${esc(d.invoiceNo)}</strong></div>
        <div class="mbill-meta">Date: <strong>${esc(d.billDate)}</strong></div>
      </div>
    </div>

    <div class="mbill-parties">
      <div>
        <div class="m-block-title">Bill To</div>
        <div class="mbill-pname">${esc(d.custName)}</div>
        ${d.custContact ? `<div class="mbill-pline">Contact: ${esc(d.custContact)}</div>` : ''}
        ${d.insuranceCo ? `<div class="mbill-pline">Insurer: ${esc(d.insuranceCo)}</div>` : ''}
      </div>
      <div>
        <div class="m-block-title">Vehicle</div>
        ${d.vehicleModel ? `<div class="mbill-pline">${esc(d.vehicleModel)}</div>` : ''}
        ${d.regNo ? `<div class="mbill-pline">Reg No: <strong>${esc(d.regNo)}</strong></div>` : ''}
        ${d.vin ? `<div class="mbill-pline">VIN: ${esc(d.vin)}</div>` : ''}
        ${d.odometer ? `<div class="mbill-pline">Odometer: ${esc(d.odometer)}</div>` : ''}
      </div>
    </div>

    ${parts.length ? `<div class="m-block-title m-section">Parts &amp; Materials</div>
    <table class="mbill-table">
      <thead><tr><th>#</th><th class="m-left">Description</th><th>Qty</th><th>Rate</th><th>Disc</th><th>${esc(d.taxType)}</th><th>Amount</th></tr></thead>
      <tbody>${partRows}</tbody>
    </table>` : ''}

    ${labour.length ? `<div class="m-block-title m-section">Labour &amp; Services</div>
    <table class="mbill-table mbill-table-labour">
      <thead><tr><th>#</th><th class="m-left">Description</th><th>Rate</th><th>Disc</th><th>${esc(d.taxType)}</th><th>Amount</th></tr></thead>
      <tbody>${labourRows}</tbody>
    </table>` : ''}

    <div class="mbill-foot">
      <div class="mbill-words">
        <div class="m-block-title">Amount in Words</div>
        <div class="mbill-words-val">${numberToWords(t.grand)}</div>
        ${d.terms ? `<div class="m-block-title m-section">Terms &amp; Conditions</div>
          <div class="mbill-terms">${esc(d.terms).replace(/\n/g, '<br>')}</div>` : ''}
      </div>
      <div class="mbill-totals">
        <div class="m-trow"><span>Sub Total</span><span>${money(cur, t.gross)}</span></div>
        <div class="m-trow"><span>Discount</span><span>- ${money(cur, t.discAmt)}</span></div>
        <div class="m-trow"><span>Taxable Value</span><span>${money(cur, t.taxable)}</span></div>
        ${taxRows}
        <div class="m-trow m-grand"><span>Grand Total</span><span>${money(cur, t.grand)}</span></div>
      </div>
    </div>

    <div class="mbill-sign">
      <div><div class="m-line"></div>Customer Signature</div>
      <div><div class="m-line"></div>For ${esc(d.workshopName)}</div>
    </div>
    <div class="mbill-note">This is a computer-generated ${esc(d.docTitle.toLowerCase())} and does not require a physical signature.</div>
  </div>`;
}

/* ---- DOM refs ---- */
const billPreview = document.getElementById('billPreview');
const previewContainer = document.getElementById('previewContainer');
const downloadBtn = document.getElementById('downloadBtn');
const logoInput = document.getElementById('logoInput');
const logoPreview = document.getElementById('logoPreview');
const uploadLogoBtn = document.getElementById('uploadLogoBtn');
const clearLogoBtn = document.getElementById('clearLogoBtn');
const previewModal = document.getElementById('previewModal');
const modalBody = document.getElementById('modalBody');
const closeModalBtn = document.getElementById('closeModalBtn');
const expandPreviewBtn = document.getElementById('expandPreviewBtn');
const formPanel = document.querySelector('.form-panel');

/* ---- Update preview ---- */
function updatePreview() {
  billPreview.innerHTML = renderBill(getData());
  const wm = previewContainer.querySelector('.preview-watermark');
  if (wm) wm.style.display = 'flex';
}

/* ---- Input handling (static fields + line items) ---- */
formPanel.addEventListener('input', function (e) {
  const t = e.target;
  if (t.dataset && t.dataset.li) {
    const arr = t.dataset.li === 'part' ? parts : labour;
    const i = +t.dataset.index;
    if (arr[i]) arr[i][t.dataset.field] = t.value;
  }
  updatePreview();
});

/* ---- Add / remove rows ---- */
formPanel.addEventListener('click', function (e) {
  const add = e.target.closest('[data-add]');
  if (add) {
    if (add.dataset.add === 'part') parts.push({ desc: '', qty: '1', rate: '', disc: '0', gst: '18' });
    else labour.push({ desc: '', rate: '', disc: '0', gst: '18' });
    renderRows();
    updatePreview();
    return;
  }
  const rem = e.target.closest('[data-remove]');
  if (rem) {
    const i = +rem.dataset.index;
    if (rem.dataset.remove === 'part') parts.splice(i, 1);
    else labour.splice(i, 1);
    renderRows();
    updatePreview();
  }
});

/* ---- Logo upload ---- */
uploadLogoBtn.addEventListener('click', () => logoInput.click());
clearLogoBtn.addEventListener('click', () => {
  logoInput.value = '';
  const existing = logoPreview.querySelector('img');
  if (existing) existing.remove();
  logoPreview.innerHTML = `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg><span>Upload Logo</span>`;
  updatePreview();
});
logoInput.addEventListener('change', function () {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => { logoPreview.innerHTML = `<img src="${e.target.result}" alt="Logo">`; updatePreview(); };
  reader.readAsDataURL(file);
});

/* ---- PDF download ---- */
downloadBtn.addEventListener('click', function () {
  const btn = this;
  const orig = btn.innerHTML;
  btn.innerHTML = '<span class="spinner"></span> Generating...';
  btn.disabled = true;
  const d = getData();
  const wm = previewContainer.querySelector('.preview-watermark');
  if (wm) wm.style.display = 'none';

  const clone = billPreview.cloneNode(true);
  const wrapper = document.createElement('div');
  wrapper.appendChild(clone);
  wrapper.style.background = '#fff';
  wrapper.style.width = '760px';
  wrapper.style.padding = '0';

  const opt = {
    margin: [8, 8, 8, 8],
    filename: d.fileName + '.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, allowTaint: true, letterRendering: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(wrapper).save().then(() => {
    btn.innerHTML = orig; btn.disabled = false; if (wm) wm.style.display = 'flex';
  }).catch(err => {
    console.error('PDF Error:', err);
    btn.innerHTML = orig; btn.disabled = false; if (wm) wm.style.display = 'flex';
    alert('Failed to generate PDF. Please try again.');
  });
});

/* ---- Fullscreen ---- */
expandPreviewBtn.addEventListener('click', function () {
  modalBody.innerHTML = `<div class="bill-preview" style="padding:0;min-height:auto">${renderBill(getData())}</div>`;
  previewModal.classList.add('open');
});
closeModalBtn.addEventListener('click', () => previewModal.classList.remove('open'));
previewModal.addEventListener('click', function (e) { if (e.target === this) this.classList.remove('open'); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') previewModal.classList.remove('open'); });

/* ---- Init ---- */
document.getElementById('billDate').value = todayISO();
renderRows();
updatePreview();
