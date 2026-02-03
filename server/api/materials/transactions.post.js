export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)

        // Validation
        if (!body.materialId || !body.quantity || !body.type) {
            throw createError({ statusCode: 400, statusMessage: 'Missing required fields: materialId, quantity, type' })
        }

        const client = await pool.connect()

        try {
            await client.query('BEGIN')

            // 1. Insert Transaction Record
            const insertRes = await client.query(
                `INSERT INTO material_transactions 
                (material_id, transaction_type, quantity, notes, reference_doc, related_unit_id, transaction_date, created_by)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id`,
                [
                    body.materialId,
                    body.type, // 'IN' or 'OUT'
                    body.quantity,
                    body.notes || '',
                    body.reference || '',
                    body.unitId || null,
                    body.transactionDate || new Date(), // Allow manual date or default to now
                    'System' // Placeholder for user
                ]
            )

            // 2. Update Inventory Stock
            // If IN: Add stock. If OUT: Subtract stock.
            const adjustment = body.type === 'IN' ? body.quantity : -body.quantity

            await client.query(
                `UPDATE material_inventory 
                 SET current_stock = current_stock + $1, updated_at = NOW()
                 WHERE material_id = $2`,
                [adjustment, body.materialId]
            )

            await client.query('COMMIT')

            return { success: true, message: 'Transaction recorded successfully' }

        } catch (e) {
            await client.query('ROLLBACK')
            throw e
        } finally {
            client.release()
        }

    } catch (error) {
        console.error('Error recording transaction:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error recording transaction'
        })
    }
})
