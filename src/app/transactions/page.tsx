import { getTransactions, getMasterAccounts } from "@/lib/actions";
import TransactionsClient from "./TransactionsClient";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const [txRes, accRes] = await Promise.all([
    getTransactions(),
    getMasterAccounts(),
  ]);

  const transactions = txRes.success ? txRes.data : [];
  const masterAccounts = accRes.success 
    ? accRes.data.map(acc => ({ id: acc.id, accountName: acc.accountName }))
    : [];

  return (
    <TransactionsClient
      initialTransactions={transactions}
      masterAccounts={masterAccounts}
    />
  );
}
