import express, { Response } from 'express';
import dotenv from "dotenv"
import { sql } from './config/db';
import transactionRoute from './routes/transaction.route';
import rateLimiterMiddleware from './rateLimiter';
import cronJob from './config/cron';

const app = express();
dotenv.config();

if (process.env.NODE_ENV === "production") cronJob.start()

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiterMiddleware)

const port = process.env.PORT || 5001;

enum category {
    FOOD = "food",
    TRANSPORT = "transport",
    UTILITIES = "utilities",
    ENTERTAINMENT = "entertainment",
    TRAVEL = "travel",
    SALARY = "salary",
    MOVIE = "movie",
    SHOPPING = "shopping",
    HEALTH = "health",
    OTHER = "other"
}

async function initDB() {
    try {
        // Create a string of category values for the CHECK constraint
        const categoryValues = Object.values(category).map(cat => `'${cat}'`).join(", ");

        await sql.unsafe(`CREATE TABLE IF NOT EXISTS transactions(
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            title VARCHAR(255) NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            category VARCHAR(255) NOT NULL CHECK (category IN (${categoryValues})),
            created_at DATE NOT NULL DEFAULT CURRENT_DATE
        )`);
        console.log("Database initialized successfully");
    } catch (error) {
        console.error("Database initialization failed:", error);
        process.exit(1);
    }
}
app.get("/api/health", (req, res) => {
    res.status(200).json({ message: "Server is healthy", status: "ok" });
})
app.use('/api/transactions', transactionRoute)

initDB().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
})