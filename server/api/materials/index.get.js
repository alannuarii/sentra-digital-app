export default defineEventHandler(async (event) => {
    try {
        // Query to fetch materials, inventory, and machine configs
        // We use JSON aggregation to group the usage data (machine configs) per material
        const sql = `
            SELECT 
                m.id,
                m.name,
                m.part_number,
                m.unit,
                mi.current_stock as stock,
                mi.lead_time_days as "leadTime",
                COALESCE(
                    json_agg(
                        json_build_object(
                            'engine', mmc.machine_name,
                            'qtyPerPm', mmc.qty_per_pm,
                            'intervalPm', mmc.interval_pm
                        ) 
                    ) FILTER (WHERE mmc.id IS NOT NULL), 
                    '[]'
                ) as usage
            FROM materials m
            LEFT JOIN material_inventory mi ON m.id = mi.material_id
            LEFT JOIN machine_material_configs mmc ON m.id = mmc.material_id
            GROUP BY m.id, m.name, m.part_number, m.unit, mi.current_stock, mi.lead_time_days
            ORDER BY m.id ASC;
        `

        const result = await query(sql)
        const materials = result.rows

        // Post-processing to match the frontend 'unitIds' requirement
        // The database stores 'SWD 6FHD 240' as a string.
        // The frontend expects logic like: { engine: "SWD 6FHD 240", unitIds: [1] }
        // We need to map the Machine Name string back to Unit IDs based on the hardcoded logic we had.
        // Since the DB migration didn't store unit_ids explicitly (it stored machine_name), we need to reconstruct it or strict mapping.

        // Mapping Logic (Replicating fastMovingMaster.js logic)
        const getUnitIds = (machineName) => {
            if (machineName === 'SWD 6FHD 240') return [1]
            if (machineName === 'Deutz TBD 616 V12') return [4, 5]
            if (machineName === 'Mitsubishi S16R PTA-S') return [6, 7]
            if (machineName === 'Cummins KTA50-G8') return [8, 9]
            return []
        }

        const processed = materials.map(m => ({
            ...m,
            stock: Number(m.stock), // Ensure number
            usage: m.usage.map(u => ({
                ...u,
                qtyPerPm: Number(u.qtyPerPm),
                unitIds: getUnitIds(u.engine)
            }))
        }))

        return processed

    } catch (error) {
        console.error('Error fetching materials:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error fetching materials'
        })
    }
})
