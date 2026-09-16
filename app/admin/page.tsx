import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStoreConfig } from "@/lib/store-utils";
import AdminDashboard from "@/app/components/admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const store = await getStoreConfig();

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const reviews = await prisma.review.findMany({
    include: { product: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <AdminDashboard
      initialStore={JSON.parse(JSON.stringify(store))}
      initialCategories={JSON.parse(JSON.stringify(categories))}
      initialProducts={JSON.parse(JSON.stringify(products))}
      initialCoupons={JSON.parse(JSON.stringify(coupons))}
      initialOrders={JSON.parse(JSON.stringify(orders))}
      initialReviews={JSON.parse(JSON.stringify(reviews))}
    />
  );
}
