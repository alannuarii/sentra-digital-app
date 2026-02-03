import pg from 'pg'

const config = useRuntimeConfig()

// Use a singleton pattern to prevent multiple pools in development
let pool

if (!pool) {
    pool = new pg.Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    })
}

export const query = async (text, params) => {
    const client = await pool.connect()
    try {
        const res = await client.query(text, params)
        return res
    } finally {
        client.release()
    }
}
