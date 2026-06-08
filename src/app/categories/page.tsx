import { getCategories } from "@/lib/actions";
import CategoriesClient from "./CategoriesClient";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const res = await getCategories();
  const categories = res.success ? res.data : [];

  return <CategoriesClient initialCategories={categories} />;
}
