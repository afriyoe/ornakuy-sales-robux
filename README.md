# ORNA KUY - Sales Robux

Dashboard pencatatan sales Robux, payout, saldo grup, dan akun. Satu file `index.html`, tanpa build.

## Isi repository

| File | Fungsi |
|---|---|
| `index.html` | Dashboard (Dashboard, Sales, Payout, Akun) — di-hosting lewat GitHub Pages |
| `apps-script/Code.gs` | Script Google Apps Script penghubung ke spreadsheet |
| `apps-script/appsscript.json` | Manifest Apps Script (Web app: execute as me, akses anyone) |

## Menyambungkan ke Google Sheets (sekali saja)

1. Buka spreadsheet → **Extensions → Apps Script**, hapus isinya, tempel isi `apps-script/Code.gs`.
2. Ganti `GANTI_DENGAN_KUNCI_RAHASIAMU` dengan kunci buatanmu, simpan.
3. **Deploy → New deployment → Web app** — Execute as: **Me**, Who has access: **Anyone**. Izinkan aksesnya.
4. Buka dashboard → tombol **Spreadsheet** di header → tempel Web App URL (`…/exec`) dan kunci → **Simpan & tes**.
5. Kalau spreadsheet masih kosong, klik **Kirim semua data** sekali.

Setelah tersambung, setiap perubahan otomatis tersimpan ke spreadsheet dan halaman mengecek ulang tiap 30 detik.

## Keamanan

- Jangan commit file backup `.json` dari dashboard — isinya sandi akun (`.gitignore` sudah memblokirnya).
- Kunci Apps Script **tidak** disimpan di repository; hanya di browser yang memakainya.
- Sandi halaman hanya pengaman ringan di sisi browser. Data yang perlu dijaga ada di spreadsheet: pastikan Share spreadsheet **Restricted**.
