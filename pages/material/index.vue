<template>
  <div class="animate-fade-in">
    <div class="flex justify-between items-center mb-6">
      <h1 class="home-title m-0">Daftar Material Cadang PLTD Tahuna</h1>
      
      <!-- Add Material Button (Matching Periodic Design) -->
      <div class="flex gap-2">
         <NuxtLink to="/material/transactions" class="btn btn-secondary flex items-center no-underline">
            <span class="mr-2">📋</span> Log Transaksi
         </NuxtLink>
         <button class="btn btn-primary" @click="openAddModal">
            <span class="mr-2">+</span> Tambah Material
         </button>
      </div>
    </div>
    
    <!-- Data Card (Usage Standard Card Class) -->
    <div class="card">
      <div class="card-header">
        <div class="flex items-center gap-2">
          <span>📦 Inventory Material Fast Moving</span>
        </div>
      </div>
      
      <div v-if="pending" class="text-center py-8">
        <div class="spinner spinner-lg"></div>
        <div class="mt-4 text-muted">Loading Inventory Data...</div>
      </div>

      <div v-else-if="error" class="p-8 text-center text-red-500">
         Failed to load data. Please check connection.
      </div>

      <div v-else class="card-body p-0">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th class="text-center w-12">No</th>
                <th>Nama Material & Spek</th>
                <th class="text-center">Part Number</th>
                <th class="text-center">Stock</th>
                <th class="text-center">Est. Habis</th>
                <th class="text-center text-blue" title="Safety Stock">SS</th>
                <th class="text-center text-orange" title="Reorder Point">ROP</th>
                <th class="text-center text-green" title="Reorder Quantity (90 Days)">ROQ</th>
                <th class="text-center w-24">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in processedMaterials" :key="index">
                <td class="text-center font-mono text-xs">{{ index + 1 }}</td>
                
                <!-- Nama Material & Info Unit -->
                <td class="align-middle">
                  <div class="font-bold text-dark text-sm">{{ item.name }}</div>
                  <div class="mt-1">
                    <span class="badge badge-gray text-[11px]">
                      Unit: {{ item.unitListString }}
                    </span>
                  </div>
                </td>

                <!-- Part Number -->
                <td class="text-center font-mono text-xs text-muted align-middle">
                  {{ item.partNumber }}
                </td>

                <!-- Stock -->
                <td class="text-center align-middle">
                  <span class="stock-badge">{{ item.stock }} {{ item.unit }}</span>
                  <div v-if="item.stockDrum" class="drum-badge">
                    ({{ item.stockDrum }} Drum)
                  </div>
                </td>

                <!-- Est. Habis -->
                <td class="text-center align-middle">
                   <div v-if="item.dailyDemand > 0" class="flex flex-col items-center">
                      <span :class="['text-xs font-bold', item.daysUntilEmpty < 30 ? 'text-danger' : 'text-dark']">
                        {{ item.estEmptyDate }}
                      </span>
                      <span class="text-[10px] text-muted">
                        ({{ item.daysUntilEmpty }} hari)
                      </span>
                   </div>
                   <span v-else class="text-xs text-muted">-</span>
                </td>

                <!-- ROP Parameters -->
                <td class="text-center font-bold text-blue bg-blue-light align-middle text-sm border-end">
                  {{ item.ss }}
                  <div v-if="item.ssDrum" class="drum-badge-blue">
                    ({{ item.ssDrum }} Drum)
                  </div>
                </td>
                <td class="text-center font-bold text-orange bg-orange-light align-middle text-sm border-end">
                  {{ item.rop }}
                  <div v-if="item.ropDrum" class="drum-badge-orange">
                    ({{ item.ropDrum }} Drum)
                  </div>
                </td>
                <td class="text-center font-bold text-green bg-green-light align-middle text-sm">
                  {{ item.roq }}
                  <div v-if="item.roqDrum" class="drum-badge-green">
                    ({{ item.roqDrum }} Drum)
                  </div>
                </td>

                <!-- Status -->
                <td class="text-center align-middle">
                  <span :class="['status-badge', item.stock <= item.rop ? 'status-danger' : 'status-success']">
                    {{ item.stock <= item.rop ? 'PERMINTAAN' : 'AMAN' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add Material Modal (Matching Periodic Design) -->
    <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Tambah Material Baru</h3>
          <button class="modal-close" @click="closeModal">✕</button>
        </div>
        
        <div class="modal-body">
          <div class="grid grid-cols-2 gap-4">
             <div class="form-group">
                <label class="form-label">Nama Material</label>
                <input v-model="form.name" type="text" class="form-input" placeholder="Contoh: Lube Oil Filter">
             </div>
             <div class="form-group">
                <label class="form-label">Part Number</label>
                <input v-model="form.partNumber" type="text" class="form-input">
             </div>
          </div>

          <div class="form-group mb-4">
             <label class="form-label">Satuan</label>
             <select v-model="form.unit" class="form-select">
                <option value="Buah">Buah</option>
                <option value="Liter">Liter</option>
                <option value="Set">Set</option>
                <option value="Meter">Meter</option>
             </select>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-4">
             <div class="form-group">
                <label class="form-label">Stok Awal</label>
                <input v-model.number="form.stock" type="number" min="0" class="form-input">
             </div>
             <div class="form-group">
                <label class="form-label">Lead Time (Hari)</label>
                <input v-model.number="form.leadTime" type="number" min="1" class="form-input">
             </div>
          </div>

          <!-- Usage Config -->
          <div class="usage-section p-3 rounded bg-gray-50 border">
             <div class="flex justify-between items-center mb-2">
                <label class="form-label m-0">Konfigurasi Mesin</label>
                <button type="button" @click="addUsageRow" class="btn btn-sm btn-outline-primary">+ Tambah</button>
             </div>

             <div v-if="form.usage.length === 0" class="text-center py-2 text-sm text-muted">
                Belum ada mesin.
             </div>

             <div v-for="(usage, idx) in form.usage" :key="idx" class="usage-row mb-2 p-2 bg-white border rounded shadow-sm">
                <div class="grid grid-cols-12 gap-2">
                   <div class="col-span-12 mb-2">
                      <select v-model="usage.machineName" class="form-select text-xs">
                        <option value="" disabled>Pilih Mesin...</option>
                        <option value="SWD 6FHD 240">SWD 6FHD 240 (Unit 1)</option>
                        <option value="Deutz TBD 616 V12">Deutz TBD 616 V12 (Unit 4, 5)</option>
                        <option value="Mitsubishi S16R PTA-S">Mitsubishi S16R (Unit 6, 7)</option>
                        <option value="Cummins KTA50-G8">Cummins KTA50 (Unit 8, 9)</option>
                      </select>
                   </div>
                   <div class="col-span-5">
                      <input v-model.number="usage.qtyPerPm" type="number" placeholder="Qty" class="form-input text-xs">
                   </div>
                   <div class="col-span-5">
                      <select v-model.number="usage.intervalPm" class="form-select text-xs">
                        <option value="250">250 Jam</option>
                        <option value="500">500 Jam</option>
                        <option value="1000">1000 Jam</option>
                        <option value="3000">3000 Jam</option>
                        <option value="6000">6000 Jam</option>
                      </select>
                   </div>
                   <div class="col-span-2 flex justify-end">
                       <button @click="removeUsageRow(idx)" class="btn btn-sm text-danger hover:bg-red-50 flex items-center justify-center h-8 w-8 rounded-full transition-colors" title="Hapus Konfigurasi">
                          ✕
                       </button>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">Batal</button>
          <button class="btn btn-primary" @click="submitMaterial" :disabled="isSubmitting">
            {{ isSubmitting ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
// --- FETCH DATA FROM API ---
const { data: materials, pending, error, refresh } = await useFetch('/api/materials')

// --- CONSTANTS ---
const MAX_RUNNING_HOURS = 24 
const MAX_LEAD_TIME_FACTOR = 1.5 
const COVERAGE_DAYS = 90 
const DEFECT_BUFFER = 0.05 
const DRUM_CONVERSION_RATE = 209 // 1 Drum = 209 Liter

// --- DATE HELPER ---
const formatDate = (days) => {
  if (!isFinite(days)) return 'N/A'
  const date = new Date()
  date.setDate(date.getDate() + days)
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: '2-digit' }).format(date)
}

// --- LOGIC ---
const processedMaterials = computed(() => {
  if (!materials.value) return []

  return materials.value.map(item => {
    let totalDailyDemand = 0
    let totalMaxDailyDemand = 0
    const allUnitIds = new Set()
    
    // 1. Calculate Demand from Usage
    if (item.usage) {
        item.usage.forEach(u => {
            // Collect Unit IDs for display
            u.unitIds.forEach(id => allUnitIds.add(id))
            
            const numEngines = u.unitIds.length
            const isBaseload = u.unitIds.some(uid => [6, 7, 8, 9].includes(uid))
            const avgRunningHours = isBaseload ? 24 : 4 

            const dailyDemand = (u.qtyPerPm / u.intervalPm) * avgRunningHours * numEngines
            const maxDailyDemand = (u.qtyPerPm / u.intervalPm) * MAX_RUNNING_HOURS * numEngines
            
            totalDailyDemand += dailyDemand
            totalMaxDailyDemand += maxDailyDemand
        })
    }

    // 2. Constants & Factors
    const leadTimeAvg = item.leadTime
    const leadTimeMax = item.leadTime * MAX_LEAD_TIME_FACTOR

    // 3. Safety Stock
    let ss = (totalMaxDailyDemand * leadTimeMax) - (totalDailyDemand * leadTimeAvg)
    ss = Math.max(0, ss) 

    // 4. ROP
    const rop = (totalDailyDemand * leadTimeAvg) + ss

    // 5. ROQ (Coverage + Defect)
    const roq = (totalDailyDemand * COVERAGE_DAYS) * (1 + DEFECT_BUFFER)
    
    // Drum Conversion applied to Stock, SS, ROP, ROQ
    let stockDrum = null
    let ssDrum = null
    let ropDrum = null
    let roqDrum = null

    // STRICT CHECK: Only for Liter units (Lube Oil)
    if (item.unit === 'Liter') {
      stockDrum = Math.ceil(item.stock / DRUM_CONVERSION_RATE)
      ssDrum = Math.ceil(ss / DRUM_CONVERSION_RATE)
      ropDrum = Math.ceil(rop / DRUM_CONVERSION_RATE)
      roqDrum = Math.ceil(roq / DRUM_CONVERSION_RATE)
    }

    // 6. Estimasi Habis
    const daysUntilEmpty = totalDailyDemand > 0 ? Math.floor(item.stock / totalDailyDemand) : 9999
    const estEmptyDate = formatDate(daysUntilEmpty)
    
    // Format Unit List String (e.g., "1, 4, 5")
    const unitListString = Array.from(allUnitIds).sort((a, b) => a - b).join(', ')

    return {
      name: item.name,
      partNumber: item.part_number, // Fix: API returns underscore
      unit: item.unit,
      stock: item.stock,
      leadTime: item.leadTime,
      unitListString,
      
      // Calculated Values
      dailyDemand: totalDailyDemand,
      daysUntilEmpty,
      estEmptyDate,
      ss: Math.ceil(ss),
      rop: Math.ceil(rop),
      roq: Math.ceil(roq),
      
      // Drum Conversions
      stockDrum,
      ssDrum,
      ropDrum,
      roqDrum
    }
  })
})

// --- MODAL LOGIC ---
const isModalOpen = ref(false)
const isSubmitting = ref(false)

const form = reactive({
  name: '',
  partNumber: '',
  unit: 'Buah',
  stock: 0,
  leadTime: 30,
  usage: []
})

const openAddModal = () => {
  form.name = ''
  form.partNumber = ''
  form.unit = 'Buah'
  form.stock = 0
  form.leadTime = 30
  form.usage = []
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const addUsageRow = () => {
  form.usage.push({ machineName: '', qtyPerPm: 1, intervalPm: 500 })
}

const removeUsageRow = (index) => {
  form.usage.splice(index, 1)
}

const submitMaterial = async () => {
  if (!form.name) return alert('Nama Material wajib diisi')
  
  isSubmitting.value = true
  try {
    await $fetch('/api/materials', {
      method: 'POST',
      body: form
    })
    closeModal()
    refresh()
  } catch (err) {
    alert('Gagal menyimpan: ' + err.message)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
/* COPIED FROM PERIODIC/INDEX.VUE PATTERN */
.table-responsive {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th, .table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--gray-200);
  vertical-align: middle;
  text-align: center; /* Default all to center */
}

.table th {
  background: var(--gray-50);
  font-weight: 600;
  color: var(--gray-600);
  border-bottom: 2px solid var(--gray-200);
  white-space: nowrap;
}

/* Specific: Column 2 (Name) Left Aligned */
.table th:nth-child(2), .table td:nth-child(2) {
  text-align: left;
}

.table tbody tr:hover {
  background: var(--gray-50);
}

/* Badges & Text */
.badge {
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.75rem;
}
.badge-gray { background: var(--gray-100); color: var(--gray-700); }

.stock-badge {
    background: var(--gray-100);
    padding: 4px 8px;
    border-radius: 6px;
    font-weight: 600;
}

.text-blue { color: var(--primary-600); }
.text-orange { color: var(--warning); }
.text-green { color: var(--success); }
.text-danger { color: var(--danger); }
.text-muted { color: var(--gray-500); }
.text-dark { color: var(--gray-800); }

.bg-blue-light { background: var(--primary-50); }
.bg-orange-light { background: #fff7ed; }
.bg-green-light { background: #f0fdf4; }

.drum-badge {
    font-size: 10px;
    color: var(--gray-500);
    margin-top: 4px;
    background: var(--gray-100);
    padding: 2px 4px;
    border-radius: 4px;
    display: inline-block;
}
.drum-badge-blue { font-size: 10px; color: var(--primary-700); background: var(--primary-100); padding: 2px 4px; border-radius: 4px; display: inline-block; margin-top: 2px; }
.drum-badge-orange { font-size: 10px; color: var(--warning-dark); background: #fffcf5; padding: 2px 4px; border-radius: 4px; display: inline-block; margin-top: 2px; }
.drum-badge-green { font-size: 10px; color: var(--success-dark); background: #ecfdf5; padding: 2px 4px; border-radius: 4px; display: inline-block; margin-top: 2px; }

.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}
.status-success { background: var(--success-light); color: var(--success-dark); }
.status-danger { background: var(--danger-light); color: var(--danger); animation: pulse 2s infinite; }

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

/* --- MODAL STYLES (COPIED) --- */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-4);
}

.modal {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 500px;
  margin: var(--space-4);
}

.modal-header {
  padding: var(--space-4);
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  font-size: var(--font-size-lg);
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: var(--gray-500);
  padding: 0;
  line-height: 1;
}

.modal-body {
  padding: var(--space-4);
  max-height: 70vh;
  overflow-y: auto;
}

.modal-footer {
  padding: var(--space-4);
  border-top: 1px solid var(--gray-200);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}
</style>
