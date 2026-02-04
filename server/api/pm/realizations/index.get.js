// Get list of PM realizations with optional filters
import { query } from '~/server/lib/db/postgres'

export default defineEventHandler(async (event) => {
    const queryParams = getQuery(event)
    const { start, end, unit, page = 1, limit = 10 } = queryParams

    // Construct base WHERE clause
    let whereClause = `WHERE 1=1`
    const params = []
    let paramIndex = 1

    if (start) {
        whereClause += ` AND r.tanggal_pelaksanaan >= $${paramIndex}`
        params.push(start)
        paramIndex++
    }

    if (end) {
        whereClause += ` AND r.tanggal_pelaksanaan <= $${paramIndex}`
        params.push(end)
        paramIndex++
    }

    if (unit) {
        whereClause += ` AND r.unit = $${paramIndex}`
        params.push(parseInt(unit))
        paramIndex++
    }

    try {
        // 1. Get total count
        const countSql = `SELECT COUNT(*) as total FROM pm_realizations r ${whereClause}`
        // Use a separate params array for count query if necessary, but here it's safe since params are same order
        const countResult = await query(countSql, params)
        const total = parseInt(countResult[0]?.total || 0)

        // 2. Get paginated data
        const offset = (page - 1) * limit
        let dataSql = `
            SELECT 
                r.id,
                r.tanggal_pelaksanaan,
                r.unit,
                r.mesin,
                r.jenis_pm,
                r.catatan,
                r.created_at,
                r.updated_at
            FROM pm_realizations r
            ${whereClause}
            ORDER BY r.tanggal_pelaksanaan DESC, r.created_at DESC
        `

        const dataParams = [...params]

        // Only add LIMIT and OFFSET if limit > 0
        if (parseInt(limit) > 0) {
            dataSql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
            dataParams.push(limit, offset)
        }

        const realizations = await query(dataSql, dataParams)

        return {
            data: realizations,
            meta: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: parseInt(limit) > 0 ? Math.ceil(total / limit) : 1
            }
        }
    } catch (error) {
        console.error('Error fetching realizations:', error)
        throw createError({
            statusCode: 500,
            message: 'Failed to fetch realizations'
        })
    }
})
