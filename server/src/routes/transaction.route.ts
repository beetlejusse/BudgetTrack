import { Request, Response, Router } from "express";
import { sql } from "../config/db";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
    try {
        const { title, amount, category, user_id } = req.body;

        if (!title || !amount || !category || !user_id) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const transaction = await sql`
            INSERT INTO transactions(title, amount, category, user_id)
            VALUES(${title}, ${amount}, ${category}, ${user_id})
            RETURNING *
        `;

        console.log("transaction created", transaction)
        res.status(201).json(transaction[0]);
    } catch (error) {
        console.error("Error registering transaction:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
})

router.get("/:userId", async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const transaction = await sql`
            SELECT * FROM transactions WHERE user_id = ${userId} ORDER BY created_at DESC
        `;

        console.log("transaction fetched successfully", transaction)
        res.status(200).json({
            transactions: transaction,
            message: "Transactions fetched successfully"
        });
    } catch (error) {
        console.log("Error fetching transaction:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

router.delete("/:id", async (req: Request, res: Response) => {
    try {
        const {id} = req.params;

        const deletedresult = await sql`
            DELETE FROM transactions WHERE user_id = ${id} RETURNING *
        `;

        if (deletedresult.length === 0) {
            return res.status(404).json({ message: "Transaction not found" });
        }
        res.status(200).json({ message: "Transaction deleted successfully" });
    } catch (error) {
        console.log("Error deleting transaction:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

router.get("/summary/:userId", async(req:Request, res:Response) => {
    try {
        const {userId} = req.params;

        const userSummary = await sql`
            SELECT COALESCE(SUM(amount), 0) as balance FROM transactions WHERE user_id = ${userId}
        `;

        const incomeResult = await sql`
            SELECT COALESCE(SUM(amount), 0) as income FROM transactions WHERE user_id = ${userId} AND amount > 0 AND category IN ('salary', 'other')
        `;

        const expenseResult = await sql`
            SELECT COALESCE(SUM(amount), 0) as expense FROM transactions WHERE user_id = ${userId} AND amount < 0 AND category NOT IN ('salary')
        `;

        res.status(200).json({
            balance: userSummary[0].balance,
            income: incomeResult[0].income,
            expense: expenseResult[0].expense,
            message: "User summary fetched successfully"
        })
    } catch (error) {
        console.error("Error fetching user summary:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

export default router;
