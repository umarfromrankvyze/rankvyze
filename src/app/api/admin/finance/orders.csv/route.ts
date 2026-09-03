import { getCurrentUser } from "@/lib/auth";
import { listOrders, ordersToCsv } from "@/lib/finance";

/**
 * CSV export of the orders table, honouring whatever filter the page has on.
 *
 * Amounts stay in cents: spreadsheets are cheerfully willing to reformat a
 * currency column and lose a cent, and the whole point of an export is that it
 * reconciles against the database exactly.
 */

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return new Response("Not authorized", { status: 401 });

  const params = new URL(request.url).searchParams;
  const orders = await listOrders({
    status: params.get("status") ?? undefined,
    query: params.get("q") ?? undefined,
    take: 5000,
  });

  const filename = `rankvyze-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  return new Response(ordersToCsv(orders), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}
