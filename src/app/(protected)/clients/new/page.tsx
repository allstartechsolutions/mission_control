import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import ClientForm from "@/components/ClientForm";

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="text-sm text-gray-400">
            <span className="text-[#405189]">Mission Control</span>
            <span className="mx-2">&rsaquo;</span>
            <Link href="/clients" className="hover:text-[#405189]">Clients</Link>
            <span className="mx-2">&rsaquo;</span>
            <span>New</span>
          </nav>
          <h1 className="mt-2 text-xl font-semibold text-gray-800">Create client</h1>
          <p className="mt-1 text-sm text-gray-500">Add a new client account with business, location, and primary contact details.</p>
        </div>
        <Link
          href="/clients"
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:border-[#405189] hover:text-[#405189]"
        >
          <ChevronLeft size={16} />
          Back to clients
        </Link>
      </div>

      <ClientForm mode="create" />
    </div>
  );
}
