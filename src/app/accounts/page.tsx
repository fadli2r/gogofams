import { getMasterAccounts, getCategories } from "@/lib/actions";
import AccountsClient from "./AccountsClient";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const [accountsRes, categoriesRes] = await Promise.all([
    getMasterAccounts(),
    getCategories(),
  ]);

  const accounts = accountsRes.success ? accountsRes.data : [];
  const categories = categoriesRes.success ? categoriesRes.data : [];

  return <AccountsClient initialAccounts={accounts} categories={categories} />;
}
