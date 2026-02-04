<template>
  <div v-if="totalPages > 1" class="pagination-container">
    <div class="pagination-info">
      Showing page {{ currentPage }} of {{ totalPages }} ({{ total }} items)
    </div>
    <div class="pagination-controls">
      <button 
        class="btn btn-sm btn-secondary" 
        :disabled="currentPage === 1"
        @click="$emit('change', currentPage - 1)"
      >
        Previous
      </button>
      
      <div class="page-numbers">
        <button 
          v-for="page in visiblePages" 
          :key="page"
          class="btn btn-sm"
          :class="currentPage === page ? 'btn-primary' : 'btn-outline-secondary'"
          @click="$emit('change', page)"
        >
          {{ page }}
        </button>
      </div>

      <button 
        class="btn btn-sm btn-secondary" 
        :disabled="currentPage === totalPages"
        @click="$emit('change', currentPage + 1)"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    default: 0
  }
})

defineEmits(['change'])

const visiblePages = computed(() => {
  const delta = 2
  const range = []
  const rangeWithDots = []
  let l

  for (let i = 1; i <= props.totalPages; i++) {
    if (i === 1 || i === props.totalPages || (i >= props.currentPage - delta && i <= props.currentPage + delta)) {
      range.push(i)
    }
  }

  // Simple version: just show the range for now to avoid complexity with dots logic if not needed, 
  // or use a simpler sliding window.
  // Given standard requirements, let's keep it simple.
  
  return range
})
</script>

<style scoped>
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-top: 1px solid var(--gray-200);
  margin-top: auto;
}

.pagination-info {
  font-size: 0.875rem;
  color: var(--gray-600);
}

.pagination-controls {
  display: gap;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.btn-outline-secondary {
  background: white;
  border: 1px solid var(--gray-300);
  color: var(--gray-700);
}

.btn-outline-secondary:hover {
  background: var(--gray-50);
}
</style>
