export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)

        // Validation
        if (!body.name || !body.unit) {
            throw createError({ statusCode: 400, statusMessage: 'Name and Unit are required' })
        }

        // Transaction to insert into multiple tables
        // 1. Insert Material -> Get ID
        // 2. Insert Inventory (Stock & Lead Time)
        // 3. Insert Usage Config (Machine Settings)

        const client = await pool.connect()

        try {
            await client.query('BEGIN')

            // 1. Insert Material
            const materialRes = await client.query(
                `INSERT INTO materials (name, part_number, unit) 
                 VALUES ($1, $2, $3) 
                 RETURNING id`,
                [body.name, body.partNumber || null, body.unit]
            )
            const newMaterialId = materialRes.rows[0].id

            // 2. Insert Inventory
            await client.query(
                `INSERT INTO material_inventory (material_id, current_stock, lead_time_days)
                 VALUES ($1, $2, $3)`,
                [newMaterialId, body.stock || 0, body.leadTime || 30]
            )

            // 3. Insert Usage Config (Optional: If provided)
            // Expecting body.usage to be an array of { machineName, qtyPerPm, intervalPm }
            if (body.usage && Array.isArray(body.usage) && body.usage.length > 0) {
                for (const u of body.usage) {
                    await client.query(
                        `INSERT INTO machine_material_configs (material_id, machine_name, qty_per_pm, interval_pm)
                         VALUES ($1, $2, $3, $4)`,
                        [newMaterialId, u.machineName, u.qtyPerPm, u.intervalPm]
                    )
                }
            }

            await client.query('COMMIT')

            return { success: true, id: newMaterialId, message: 'Material created successfully' }

        } catch (e) {
            await client.query('ROLLBACK')
            throw e
        } finally {
            client.release()
        }

    } catch (error) {
        console.error('Error creating material:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error creating material'
        })
    }
})
