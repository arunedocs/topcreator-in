import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    take: 80,
  });

  return (
    <AdminShell>
      <h1 className="text-2xl font-semibold text-white">Payments</h1>
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs text-zinc-500">
            <tr>
              <th className="py-2 pr-4">Payment / order</th>
              <th className="py-2 pr-4">Creator</th>
              <th className="py-2 pr-4">Amount</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-t border-zinc-800">
                <td className="py-3 pr-4 text-xs text-zinc-300">
                  {payment.razorpayPaymentId ?? payment.razorpayOrderId}
                </td>
                <td className="py-3 pr-4">{payment.channelName}</td>
                <td className="py-3 pr-4">{formatCurrency(payment.bidAmount)}</td>
                <td className="py-3 pr-4">{payment.status}</td>
                <td className="py-3 text-xs text-zinc-500">{payment.createdAt.toISOString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
