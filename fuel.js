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
function formatShortDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}
/* Zero-padded fixed-width number to mimic thermal receipt printout (e.g. 80.33 -> "080.33") */
function padNum(value, intLen, decLen) {
  const num = parseFloat(value) || 0;
  const fixed = num.toFixed(decLen);
  const parts = fixed.split('.');
  const intStr = parts[0].padStart(intLen, '0');
  return decLen ? intStr + '.' + parts[1] : intStr;
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
    billDateShort: getVal('billDate') ? formatShortDate(getVal('billDate')) : formatShortDate(getDate()),
    billTime: getVal('billTime') || '10:30',
    fuelType: getVal('fuelType') || 'Petrol',
    customerName: getVal('customerName') || 'Customer',
    vehicleNumber: getVal('vehicleNumber') || '',
    vehicleType: getVal('vehicleType') || 'Car',
    amountWords: numberToWords(totalAmount),
    fileName: getVal('downloadFileName') || 'Fuel-Bill-Receipt',
    // IndianOil receipt template (Template 7) fields
    receiptNo: getVal('receiptNo'),
    localId: getVal('localId'),
    product: getVal('product') || getVal('fuelType') || 'Petrol',
    density: getVal('density'),
    presetType: getVal('presetType') || 'Amount',
    mobileNo: getVal('mobileNo'),
    lstNo: getVal('lstNo'),
    vatNo: getVal('vatNo')
  };
}

/* ===== Template 7: IndianOil Receipt (exact-match thermal receipt) ===== */
function renderTemplate7(d) {
  const dealer = (d.stationName || 'FUEL STATION').toUpperCase();
  const addrLines = (d.stationAddress || '')
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);
  const row = (label, value) =>
    `<div class="t7-row"><span class="t7-label">${label}</span><span class="t7-colon">:</span><span class="t7-val">${value || ''}</span></div>`;
  const hdfc = `<div class="t7-hdfc"><span class="t7-hdfc-logo"></span><span class="t7-hdfc-text">HDFC BANK</span></div>`;
  const wmCol = hdfc + hdfc + hdfc;
  return `<div class="bill bill-t7">
    <div class="bill-inner">
      <div class="t7-wm t7-wm-left" aria-hidden="true">${wmCol}</div>
      <div class="t7-wm t7-wm-right" aria-hidden="true">${wmCol}</div>
      <div class="t7-corner t7-corner-tr" aria-hidden="true">G - 5000</div>
      <div class="t7-corner t7-corner-br" aria-hidden="true">G - 5000</div>
      <div class="t7-content">
      <div class="t7-logo">
        <img src="${d.logo || 'assets/indianoil-logo.png'}" class="t7-logo-img" alt="IndianOil">
      </div>
      <div class="t7-welcome">Welcomes You</div>
      <div class="t7-dealer">${dealer}</div>
      ${addrLines.map(l => `<div class="t7-dealer-addr">${l.toUpperCase()}</div>`).join('')}
      <div class="t7-gap"></div>
      ${d.telNo ? row('Tel. No.', d.telNo) : ''}
      <div class="t7-gap"></div>
      ${row('Receipt No.', d.receiptNo)}
      ${row('Local ID', d.localId)}
      ${row('FIP No.', d.fipNo)}
      ${row('Nozzle No.', d.nozzleNo)}
      ${row('Product', d.product)}
      ${row('Density', d.density)}
      <div class="t7-gap"></div>
      ${row('Preset Type', d.presetType)}
      ${row('Rate', padNum(d.fuelRate, 3, 2))}
      ${row('Volume', padNum(d.fuelQty, 5, 2))}
      ${row('Total', padNum(d.totalAmount, 5, 2))}
      <div class="t7-gap"></div>
      ${row('Vehicle No.', d.vehicleNumber || 'Not Enterd')}
      ${row('Mobile NO', d.mobileNo || 'Not Enterd')}
      <div class="t7-gap"></div>
      <div class="t7-row"><span class="t7-label">Date</span><span class="t7-colon">:</span><span class="t7-val">${d.billDateShort} Time: ${d.billTime}</span></div>
      <div class="t7-gap"></div>
      ${row('CST NO', d.cstTin)}
      ${row('LST NO', d.lstNo)}
      ${row('VAT NO', d.vatNo)}
      <div class="t7-thanks">Thank You! Please Visit Again..</div>
      </div>
    </div>
  </div>`;
}

/* ===== Render Dispatcher ===== */
function renderBill(data) {
  return renderTemplate7(data);
}

/* ===== DOM References ===== */
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

/* ===== Update Preview ===== */
function updatePreview() {
  const data = getFormData();
  const html = renderBill(data);
  billPreview.innerHTML = html;
  previewContainer.querySelector('.preview-watermark').style.display = 'flex';
}

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
  const html = renderBill(data);
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
