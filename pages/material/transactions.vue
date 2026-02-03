<template>
  <div class="animate-fade-in">
    <div class="flex justify-between items-center mb-6">
      <h1 class="home-title m-0">Riwayat Transaksi Material</h1>
      
      <button class="btn btn-primary" @click="openModal">
        <span class="mr-2">📝</span> Input Transaksi
      </button>
    </div>

    <!-- Summary / History Card -->
    <div class="card">
        <div class="card-header">
            <span>📋 Log Keluar/Masuk Barang</span>
        </div>
        
        <div v-if="pending" class="text-center py-8">
             <div class="spinner spinner-lg"></div>
             <div class="mt-4 text-muted">Loading History...</div>
        </div>

        <div v-else class="card-body p-0">
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th class="w-12 text-center">No</th>
                            <th class="text-center">Tanggal</th>
                            <th>Material</th>
                            <th class="text-center">Tipe</th>
                            <th class="text-center">Jumlah</th>
                            <th class="text-center">Keterangan</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="transactions.length === 0">
                            <td colspan="6" class="text-center py-8 text-muted">Belum ada data transaksi.</td>
                        </tr>
                        <tr v-for="(t, index) in transactions" :key="t.id">
                            <td class="text-center font-mono text-xs">{{ index + 1 }}</td>
                            <td class="text-center text-xs">{{ formatDate(t.transaction_date) }}</td>
                            <td>
                                <div class="font-bold text-sm text-dark">{{ t.material_name }}</div>
                                <div class="text-[10px] text-muted">{{ t.part_number }}</div>
                            </td>
                            <td class="text-center">
                                <span :class="['badge', t.transaction_type === 'IN' ? 'badge-in' : 'badge-out']">
                                    {{ t.transaction_type }}
                                </span>
                            </td>
                            <td class="text-center font-bold font-mono">
                                {{ t.quantity }} {{ t.unit }}
                            </td>
                            <td class="text-center text-sm text-muted italic">
                                {{ t.notes || '-' }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Input Transaction Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Input Transaksi</h3>
          <button class="modal-close" @click="closeModal">✕</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group mb-4">
             <label class="form-label">Material</label>
             <select v-model="form.materialId" class="form-select" :disabled="materialsPending">
                <option value="" disabled>Pilih Material...</option>
                <option v-for="m in materialList" :key="m.id" :value="m.id">
                    {{ m.name }} - Stock: {{ m.stock }} {{ m.unit }}
                </option>
             </select>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-4">
              <div class="form-group">
                 <label class="form-label">Tipe Transaksi</label>
                 <select v-model="form.type" class="form-select">
                    <option value="IN">Masuk (IN)</option>
                    <option value="OUT">Keluar (OUT)</option>
                 </select>
              </div>
              <div class="form-group">
                 <label class="form-label">Jumlah</label>
                 <input v-model.number="form.quantity" type="number" min="1" class="form-input">
              </div>
          </div>
          
          <div class="form-group mb-4">
              <label class="form-label">Tanggal Transaksi</label>
              <input v-model="form.transactionDate" type="datetime-local" class="form-input">
              <p class="text-xs text-muted mt-1">Biarkan default untuk hari ini (Sekarang).</p>
          </div>

          <div class="form-group mb-4">
              <label class="form-label">Keterangan</label>
              <textarea v-model="form.notes" class="form-input" rows="2" placeholder="Contoh: Stok Baru / Pemakaian Unit 1"></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">Batal</button>
          <button class="btn btn-primary" @click="submitTransaction" :disabled="submitting">
            {{ submitting ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// --- FETCH HISTORY ---
const { data: transactions, pending, refresh } = await useFetch('/api/materials/transactions')

// --- FETCH MATERIAL LIST FOR DROPDOWN ---
const { data: materials, pending: materialsPending } = await useFetch('/api/materials')

const materialList = computed(() => materials.value || [])

// --- HELPERS ---
const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleString('id-ID', { 
      day: '2-digit', month: 'short', year: '2-digit',
      hour: '2-digit', minute: '2-digit'
  })
}

// --- MODAL LOGIC ---
const showModal = ref(false)
const submitting = ref(false)

const form = reactive({
    materialId: '',
    type: 'OUT',
    quantity: 1,
    notes: '',
    transactionDate: ''
})

const openModal = () => {
    form.materialId = ''
    form.type= 'OUT'
    form.quantity = 1
    form.notes = ''
    
    // Set default to current time in local timezone format (YYYY-MM-DDTHH:mm)
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    form.transactionDate = now.toISOString().slice(0, 16)
    
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
}

const submitTransaction = async () => {
    if (!form.materialId || !form.quantity) return alert("Lengkapi data!")

    // Basic Validation: Check stock if OUT
    if (form.type === 'OUT') {
        const selected = materialList.value.find(m => m.id === form.materialId)
        if (selected && selected.stock < form.quantity) {
             const confirm = window.confirm(`Stok saat ini (${selected.stock}) lebih kecil dari pengeluaran (${form.quantity}). Lanjutkan?`)
             if (!confirm) return
        }
    }

    submitting.value = true
    try {
        await $fetch('/api/materials/transactions', {
            method: 'POST',
            body: form
        })
        closeModal()
        refresh() // Refresh history
        // Ideally we should also refresh the material list to update stock in dropdown, but optional for now
    } catch (e) {
        alert("Error: " + e.message)
    } finally {
        submitting.value = false
    }
}
</script>

<style scoped>
/* REUSING GLOBAL STYLES */
.badge-in { background: #dcfce7; color: #166534; } /* Green */
.badge-out { background: #fee2e2; color: #991b1b; } /* Red */

/* Modal & Table Styles (Copied from material/index.vue for consistency) */
.table-responsive { overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { padding: 12px 16px; border-bottom: 1px solid var(--gray-200); vertical-align: middle; text-align: center; }
.table th { background: var(--gray-50); font-weight: 600; color: var(--gray-600); border-bottom: 2px solid var(--gray-200); }
.table th:nth-child(3), .table td:nth-child(3) { text-align: left; }
.table tbody tr:hover { background: var(--gray-50); }

.badge { padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: 600; font-size: 0.75rem; }

.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem;
}
.modal {
  background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 100%; max-width: 500px;
}
.modal-header { padding: 1rem; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
.modal-title { margin: 0; font-size: 1.125rem; font-weight: 600; }
.modal-close { background: none; border: none; font-size: 1.25rem; cursor: pointer; color: #6b7280; }
.modal-body { padding: 1rem; }
.modal-footer { padding: 1rem; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 0.5rem; }
</style>
