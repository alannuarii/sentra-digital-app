// Material Planning API - calculate materials based on PM schedule
import { generatePMSchedule } from '~/server/lib/utils/pmSchedule.js'
import { fastMovingMaterials } from '~/server/lib/data/fastMoving.js'
import { query as dbQuery } from '~/server/lib/db/postgres.js'

export default defineEventHandler(async (event) => {
    const queryParams = getQuery(event)
    const { start, end, units } = queryParams

    if (!start || !end) {
        throw createError({
            statusCode: 400,
            message: 'Start and end dates are required'
        })
    }

    // Parse selected units (can be single unit or comma-separated for grouped engines)
    let selectedUnits = []
    if (units) {
        selectedUnits = units.split(',').map(u => parseInt(u.trim()))
    }

    // Get current service hours from database
    const sqlQuery = `
        SELECT unit, overhaul AS jamoperasi FROM (
            SELECT unit, overhaul
            FROM service_hour
            ORDER BY id DESC
            LIMIT 7
        ) AS subquery
        ORDER BY unit ASC;
    `

    try {
        let dbUnits = await dbQuery(sqlQuery)

        // Filter units if specific units are selected
        if (selectedUnits.length > 0) {
            dbUnits = dbUnits.filter(u => selectedUnits.includes(u.unit))
        }

        if (dbUnits.length === 0) {
            return {
                units: selectedUnits,
                pmCounts: { P1: 0, P2: 0, P3: 0, P4: 0, P5: 0 },
                totalPM: 0,
                materials: []
            }
        }

        // Generate PM schedule for selected units in date range
        const schedule = generatePMSchedule(dbUnits, start, end)

        // Count PM types
        const pmCounts = { P1: 0, P2: 0, P3: 0, P4: 0, P5: 0 }
        schedule.forEach(event => {
            const pmType = event.title.split(' ')[0] // "P1 #7" -> "P1"
            if (pmCounts.hasOwnProperty(pmType)) {
                pmCounts[pmType]++
            }
        })

        const totalPM = Object.values(pmCounts).reduce((a, b) => a + b, 0)

        // Calculate materials based on actual PM schedule events
        // This ensures correct counting for both individual units and engine groups
        const materialsMap = new Map()

        const unitsToProcess = selectedUnits.length > 0 ? selectedUnits : dbUnits.map(u => u.unit)

        // Process each PM event in the schedule
        schedule.forEach(event => {
            const pmType = event.title.split(' ')[0] // "P1 #7" -> "P1"
            const unitNum = event.extendedProps?.unit // Unit is in extendedProps

            // Get unit's material data
            const unitData = fastMovingMaterials.find(u => u.unit === unitNum)
            if (!unitData) return

            // For each PM event, add materials that are used in that PM cycle
            // P1 materials are used in all PM types (P1, P2, P3, P4, P5)
            // P2 materials are used in P2, P3, P4, P5
            // P3 materials are used in P3, P4, P5
            // P4 materials are used in P4, P5
            // P5 materials are used in P5 only
            unitData.material.forEach(mat => {
                const matCycle = mat.cycle

                // Check if this material is used in the current PM type
                let isUsed = false
                if (matCycle === 'P1') {
                    isUsed = true // P1 materials used in all PM types
                } else if (matCycle === 'P2' && ['P2', 'P3', 'P4', 'P5'].includes(pmType)) {
                    isUsed = true
                } else if (matCycle === 'P3' && ['P3', 'P4', 'P5'].includes(pmType)) {
                    isUsed = true
                } else if (matCycle === 'P4' && ['P4', 'P5'].includes(pmType)) {
                    isUsed = true
                } else if (matCycle === 'P5' && pmType === 'P5') {
                    isUsed = true
                }

                if (!isUsed) return

                const key = `${mat.nama}-${mat.satuan}`
                if (materialsMap.has(key)) {
                    const existing = materialsMap.get(key)
                    existing.jumlah += mat.jumlah
                    if (!existing.units.includes(unitNum)) {
                        existing.units.push(unitNum)
                    }
                } else {
                    materialsMap.set(key, {
                        nama: mat.nama,
                        jumlah: mat.jumlah,
                        satuan: mat.satuan,
                        cycle: matCycle,
                        units: [unitNum]
                    })
                }
            })
        })

        // Convert map to sorted array
        const materials = Array.from(materialsMap.values()).sort((a, b) => {
            return a.nama.localeCompare(b.nama)
        })

        // Get engine info for display
        const engineInfo = unitsToProcess.map(unitNum => {
            const unitData = fastMovingMaterials.find(u => u.unit === unitNum)
            return {
                unit: unitNum,
                mesin: unitData?.mesin || 'Unknown'
            }
        })

        return {
            units: unitsToProcess,
            engineInfo,
            pmCounts,
            totalPM,
            materials,
            dateRange: { start, end }
        }

    } catch (err) {
        console.error('Database error:', err)
        throw createError({
            statusCode: 500,
            message: 'Failed to calculate material planning'
        })
    }
})
