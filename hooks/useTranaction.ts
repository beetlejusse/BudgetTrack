import { useCallback, useState } from "react";
import axios from "axios";
import { Alert } from "react-native";

const API_URL = process.env.API_URL || "https://localhost:5000/api";

export const useTransaction = ({ userId }: { userId: string }) => {
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState({
        balance: 0,
        income: 0,
        expenses: 0,
    });
    const [loading, setLoading] = useState(true);

    // used for performance reasons, it will memoize the function like only when the userId changes then it reacreates the function
    const fetchTransactions = useCallback(
        async () => {
            try {
                const res = await axios.get(`${API_URL}/transactions/${userId}`);
                const data = res.status === 200 ? res.data : [];
                const list = Array.isArray(data) ? data : (data?.transactions ?? []);
                setTransactions(list);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching transactions:", error);
            }
        }, [userId]);


    const fetchTransactionsSummary = useCallback(
        async () => {
            try {
                const res = await axios.get(`${API_URL}/transactions/summary/${userId}`);
                const data = res.status === 200 ? res.data : null;
                const nextSummary = (data?.summary ?? data) ?? {
                    balance: 0,
                    income: 0,
                    expenses: 0,
                };
                setSummary(nextSummary);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching transactions:", error);
            }
        }, [userId]);


    const loadData = useCallback(
        async () => {
            if (!userId) return;

            setLoading(true);
            try {
                await Promise.all([
                    fetchTransactions(),
                    fetchTransactionsSummary()
                ]);
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setLoading(false);
            }
        }, [userId, fetchTransactions, fetchTransactionsSummary]);

    const deleteTransaction = async ({ id }: { id: string }) => {
        try {
            const res = await axios.delete(`${API_URL}/transactions/${id}`);
            if (res.status === 200) {
                Alert.alert("Success", "Transaction deleted successfully");
            } else {
                Alert.alert("Error", "Failed to delete transaction");
            }
        } catch (error: any) {
            console.error("Error deleting transaction:", error);
            Alert.alert("Error: ", error.message);
        }
    }

    return { transactions, summary, loading, loadData, deleteTransaction };
}