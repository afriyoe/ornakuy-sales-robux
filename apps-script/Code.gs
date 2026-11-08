/**
 * ORNA KUY - Sales Robux  ↔  Google Sheets
 * Tempel di Extensions → Apps Script pada spreadsheet, ganti KUNCI, lalu Deploy sebagai Web app.
 */
const SHEET_ID = '1jxorIFEuOVPtn8CpYvq-TO8aOfSTm54a_dsJHF9NoSw';
const KUNCI = 'GANTI_DENGAN_KUNCI_RAHASIAMU';

const TABLES = {
  sales:     { sheet: 'Sales',  cols: ['id','tanggal','sumber','idPesanan','pengirim','robux','pendapatan'], nums: ['robux','pendapatan'] },
  payouts:   { sheet: 'Payout', cols: ['id','tanggal','username','payout'], nums: ['payout'] },
  accounts:  { sheet: 'Akun',   cols: ['id','username','status','sisaLimit','sandi','email','sandiEmail','tglJoin','pemakaian','saldo'], nums: ['sisaLimit','saldo'] },
  snapshots: { sheet: 'Saldo Grup', cols: ['id','tanggal','funds','pending','revenuePayouts'], nums: ['funds','pending','revenuePayouts'] },
};

function doGet(e) {
  if (!e || !e.parameter || e.parameter.key !== KUNCI) return out_({ ok: false, error: 'Kunci salah' });
  return out_({ ok: true, data: readAll_(), at: new Date().toISOString() });
}

function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return out_({ ok: false, error: 'Format tidak valid' }); }
  if (body.key !== KUNCI) return out_({ ok: false, error: 'Kunci salah' });
  if (body.action === 'saveAll') {
    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try { writeAll_(body.data || {}); } finally { lock.releaseLock(); }
    return out_({ ok: true, at: new Date().toISOString() });
  }
  return out_({ ok: false, error: 'Aksi tidak dikenal' });
}

function ss_() { return SpreadsheetApp.openById(SHEET_ID); }
function sheet_(name) { const ss = ss_(); return ss.getSheetByName(name) || ss.insertSheet(name); }

function readAll_() {
  const tz = ss_().getSpreadsheetTimeZone();
  const data = {};
  Object.keys(TABLES).forEach(function (k) {
    const t = TABLES[k], sh = sheet_(t.sheet), vals = sh.getDataRange().getValues();
    if (vals.length < 2) { data[k] = []; return; }
    const head = vals[0].map(String);
    data[k] = vals.slice(1).filter(function (r) { return r.join('') !== ''; }).map(function (r) {
      const o = {};
      t.cols.forEach(function (c) {
        const i = head.indexOf(c); let v = i > -1 ? r[i] : '';
        if (v instanceof Date) v = Utilities.formatDate(v, tz, 'yyyy-MM-dd');
        o[c] = t.nums.indexOf(c) > -1 ? (Number(v) || 0) : String(v);
      });
      if (!o.id) o.id = Utilities.getUuid();
      return o;
    });
  });
  // Pengaturan (target, pola ID)
  const sv = sheet_('Pengaturan').getDataRange().getValues(), settings = {};
  sv.slice(1).forEach(function (r) { if (r[0]) { try { settings[r[0]] = JSON.parse(r[1]); } catch (e) { settings[r[0]] = r[1]; } } });
  data.settings = settings;
  return data;
}

function writeAll_(data) {
  Object.keys(TABLES).forEach(function (k) {
    const t = TABLES[k], sh = sheet_(t.sheet), rows = (data[k] || []);
    const values = [t.cols].concat(rows.map(function (o) {
      return t.cols.map(function (c) { const v = o[c]; return t.nums.indexOf(c) > -1 ? (Number(v) || 0) : (v == null ? '' : (typeof v === 'object' ? JSON.stringify(v) : String(v))); });
    }));
    sh.clearContents();
    // kolom teks dibuat "plain text" supaya sandi seperti 012569 tidak kehilangan angka 0 dan tanggal tidak diubah
    t.cols.forEach(function (c, i) { if (t.nums.indexOf(c) === -1) sh.getRange(1, i + 1, Math.max(values.length, 2), 1).setNumberFormat('@'); });
    sh.getRange(1, 1, values.length, t.cols.length).setValues(values);
    sh.getRange(1, 1, 1, t.cols.length).setFontWeight('bold');
    sh.setFrozenRows(1);
  });
  const s = data.settings || {}, sh = sheet_('Pengaturan');
  const vals = [['key', 'value']].concat(Object.keys(s).map(function (k) { return [k, JSON.stringify(s[k])]; }));
  sh.clearContents();
  sh.getRange(1, 1, vals.length, 2).setNumberFormat('@').setValues(vals);
}

function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
