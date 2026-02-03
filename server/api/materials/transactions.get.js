export default defineEventHandler(async (event) => {
    try {
        const sql = `
            SELECT 
                t.id,
                t.transaction_date,
                t.transaction_type,
                t.quantity,
                t.notes,
                m.name as material_name,
                m.part_number,
                m.unit
            FROM material_transactions t
            JOIN materials m ON t.material_id = m.id
            ORDER BY t.transaction_date DESC
            LIMIT 50;
        `
        const result = await query(sql)

        return result.rows.map(row => ({
            ...row,
            quantity: Number(row.quantity) // Ensure number type
        }))

    } catch (error) {
        console.error('Error fetching transactions:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error fetching transactions'
        })
    }
})
