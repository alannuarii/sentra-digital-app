# Dokumentasi Logika & Alur Perhitungan Inventory ROP/ROQ

Dokumen ini menjelaskan secara rinci alur kerja, logika, dan rumus perhitungan *Reorder Point (ROP)* dan *Reorder Quantity (ROQ)* yang diimplementasikan dalam aplikasi **Sentra Digital**. Tujuannya adalah sebagai bahan justifikasi dan verifikasi kebenaran hasil perhitungan stok material fast-moving.

## 1. Alur Data (Workflow)

Sistem ini bersifat **Material-Centric**, artinya perhitungan difokuskan pada **satu jenis material** yang bisa digunakan oleh **banyak mesin**.

1.  **Master Data Material**: Menyimpan data statis barang (Nama, Part Number, Satuan, Lead Time).
2.  **Konfigurasi Penggunaan (Usage Config)**: Menyimpan logika konsumsi material per tipe mesin (Qty per PM, Interval PM).
3.  **Jam Jalan Operasional**: Sistem membedakan jam jalan berdasarkan profil mesin:
    *   **Baseload (Unit 6, 7, 8, 9)**: Diasumsikan beroperasi **24 Jam/Hari**.
    *   **Backup/Peaker (Unit 1, 4, 5)**: Diasumsikan beroperasi **4 Jam/Hari**.
4.  **Agregasi Permintaan (Demand)**: Sistem menjumlahkan total kebutuhan harian dari seluruh mesin yang menggunakan material tersebut.
5.  **Perhitungan Inventory**: Menghitung Safety Stock (SS), ROP, dan ROQ berdasarkan total permintaan.

---

## 2. Parameter & Konstanta

Berikut adalah konstanta yang digunakan dalam perhitungan:

| Parameter | Nilai | Keterangan |
| :--- | :--- | :--- |
| **Running Hours (Baseload)** | **24 Jam** | Unit 6, 7, 8, 9 (Operasi Penuh) |
| **Running Hours (Backup)** | **4 Jam** | Unit 1, 4, 5 (Operasi Beban Puncak) |
| **Max Running Hours** | **24 Jam** | Digunakan untuk menghitung *Max Daily Demand* (Skenario Terburuk) |
| **Lead Time (Rata-rata)** | **30 Hari** | Waktu tunggu pemesanan barang sampai tiba (Default) |
| **Max Lead Time Factor** | **1.5x** | Faktor pengali untuk *Max Lead Time* (Antisipasi keterlambatan 50%) |
| **Coverage Days (ROQ)** | **90 Hari** | Target durasi stok aman setelah restock (3 Bulan) |
| **Defect Buffer** | **5% (0.05)** | Tambahan buffer pada ROQ untuk antisipasi barang rusak/cacat |

---

## 3. Rumus Perhitungan

### A. Daily Demand (Permintaan Harian)
Menghitung rata-rata pemakaian barang per hari berdasarkan siklus PM mesin.

**Rumus per Mesin:**
$$ Demand_{Mesin} = \left( \frac{Qty\ per\ PM}{Interval\ PM\ (Jam)} \right) \times Jam\ Operasional \times Jumlah\ Unit $$

*   **Total Daily Demand**: Penjumlahan $Demand_{Mesin}$ dari semua mesin yang menggunakan material tersebut.
*   **Total Max Daily Demand**: Sama dengan rumus di atas, namun menggunakan **Max Running Hours (24 Jam)** untuk semua mesin (Skenario operasional penuh).

### B. Safety Stock (SS)
Stok penyangga untuk mengantisipasi lonjakan pemakaian atau keterlambatan pengiriman.

$$ SS = (Max\ Daily\ Demand \times Max\ Lead\ Time) - (Avg\ Daily\ Demand \times Avg\ Lead\ Time) $$

*   *Max Lead Time* = $Avg\ Lead\ Time \times 1.5$

### C. Reorder Point (ROP)
Titik stok minimal dimana pemesanan ulang **HARUS** dilakukan agar stok baru tiba tepat saat stok lama habis (ditambah Safety Stock).

$$ ROP = (Avg\ Daily\ Demand \times Avg\ Lead\ Time) + Safety\ Stock $$

### D. Reorder Quantity (ROQ)
Jumlah barang yang harus dipesan untuk memenuhi kebutuhan selama periode tertentu (90 hari), ditambah buffer kerusakan.

$$ ROQ = (Avg\ Daily\ Demand \times 90\ Hari) \times (1 + 5\%) $$

### E. Konversi Drum (Khusus Lube Oil)
Jika material memiliki satuan **"Liter"**, maka hasil perhitungan juga dikonversi ke satuan Drum (1 Drum = 209 Liter) dengan pembulatan ke atas (*Ceiling*).

$$ Jumlah\ Drum = \lceil \frac{Nilai\ (Liter)}{209} \rceil $$

---

## 4. Simulasi Contoh Perhitungan

**Kasus**: Material **Lube Oil** (Satuan: Liter, Lead Time: 30 Hari).
**Pengguna**:
1.  **SWD 6FHD 240 (Unit 1)**: Qty 209 Liter, Interval 1000 Jam. (Backup: 4 Jam/Hari)
2.  **Deutz TBD 616 V12 (Unit 4, 5)**: Qty 70 Liter, Interval 500 Jam. (Backup: 4 Jam/Hari)

#### Langkah 1: Hitung Daily Demand
*   **Unit 1 (SWD)**:
    *   Demand = $(209 / 1000) \times 4 \times 1 = 0.836$ Liter/Hari.
    *   Max Demand = $(209 / 1000) \times 24 \times 1 = 5.016$ Liter/Hari.
*   **Unit 4, 5 (Deutz)**:
    *   Demand = $(70 / 500) \times 4 \times 2 = 1.12$ Liter/Hari.
    *   Max Demand = $(70 / 500) \times 24 \times 2 = 6.72$ Liter/Hari.

**Total Avg Demand**: $0.836 + 1.12 = \mathbf{1.956}$ Liter/Hari
**Total Max Demand**: $5.016 + 6.72 = \mathbf{11.736}$ Liter/Hari

#### Langkah 2: Hitung Safety Stock (SS)
*   Avg Lead Time = 30 Hari.
*   Max Lead Time = $30 \times 1.5 = 45$ Hari.
*   $SS = (11.736 \times 45) - (1.956 \times 30)$
*   $SS = 528.12 - 58.68 = \mathbf{469.44}$ Liter $\approx$ **470 Liter** (3 Drum)

#### Langkah 3: Hitung ROP
*   $ROP = (1.956 \times 30) + 469.44$
*   $ROP = 58.68 + 469.44 = \mathbf{528.12}$ Liter $\approx$ **529 Liter** (3 Drum)

#### Langkah 4: Hitung ROQ
*   $ROQ = (1.956 \times 90) \times 1.05$
*   $ROQ = 176.04 \times 1.05 = \mathbf{184.84}$ Liter $\approx$ **185 Liter** (1 Drum)

---

## Kesimpulan

Dengan metode ini, aplikasi memastikan ketersediaan stok bahkan dalam kondisi ekstrem (Mesin beroperasi 24 jam penuh & pengiriman terlambat 50%), sekaligus meminimalisir risiko *stock-out* tak terduga berkat adanya **Safety Stock** yang dinamis dan **Defect Buffer**.
