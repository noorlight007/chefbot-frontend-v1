"use client";

import {
  ArrowLeft,
  Eye,
  Phone,
  Mail,
  MessageCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetAllClientsQuery } from "@/redux/reducers/reservation-reducer";
import CustomersTableSkeleton from "@/components/pages/customers/skeletons/customers-skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useMemo, useEffect } from "react";
import { CustomerDetails } from "@/components/pages/customers/modals/customer-details-modal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Customer {
  uid: string;
  name: string;
  phone: string;
  whatsapp_number: string;
  email: string;
  date_of_birth: string;
  last_visit: string;
  preferences: string[];
  allergens: string[];
  special_notes: string;
  history: {
    reservation_uid: string;
    reservation_name: string;
    reservation_date: string;
    reservation_time: string;
    reservation_status: string;
    menu: string[];
  }[];
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export default function CustomersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetAllClientsQuery({ page });

  const paginatedData = data as PaginatedResponse<Customer> | undefined;
  const customers: Customer[] = useMemo(
    () => paginatedData?.results || [],
    [paginatedData?.results],
  );
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [downloading, setDownloading] = useState(false);
  const t = useTranslations("customers");

  // Reset to page 1 when search query changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  // Transform customers data to add missing reservation_uid if needed
  const transformedCustomers = useMemo(() => {
    const list = customers.map((customer) => ({
      ...customer,
      history: customer.history.map((reservation, index) => ({
        ...reservation,
        reservation_uid:
          reservation.reservation_uid || `reservation-${customer.uid}-${index}`,
      })),
    }));

    if (!searchQuery) return list;

    const lowerQuery = searchQuery.toLowerCase();
    return list.filter(
      (c) =>
        c.name?.toLowerCase().includes(lowerQuery) ||
        c.email?.toLowerCase().includes(lowerQuery) ||
        c.phone?.toLowerCase().includes(lowerQuery) ||
        c.whatsapp_number?.toLowerCase().includes(lowerQuery),
    );
  }, [customers, searchQuery]);

  const handleDownloadExcel = async () => {
    setDownloading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASEURL}/api/clients/export-excel`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "customers.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Excel download error:", error);
      toast.error(t("downloadError") || "Failed to download Excel file");
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) {
    return <CustomersTableSkeleton />;
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 flex flex-col gap-4 lg:mb-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8 rounded-full bg-sidebar-accent/50 text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            {t("title")}
          </h1>
        </div>

        {/* Search Input & Download Button */}
        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder={t("searchPlaceholder") || "Search customers..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={handleDownloadExcel}
            disabled={downloading}
            className="flex items-center gap-2"
          >
            <Download size={16} />
            <span>{t("downloadExcel") || "Excel"}</span>
          </Button>
        </div>
      </div>

      {/* Mobile Card Layout */}
      <div className="mt-8 block md:hidden">
        <div className="space-y-4">
          {transformedCustomers.map((customer) => (
            <div
              key={customer.uid}
              className="rounded-lg border bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {customer.name || "N/A"}
                  </h3>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail size={14} className="mr-2" />
                      <span className="truncate">
                        {customer.email || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone size={14} className="mr-2" />
                      <span>{customer.phone || "N/A"}</span>
                    </div>
                    {customer.whatsapp_number && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MessageCircle size={14} className="mr-2" />
                        <span>{customer.whatsapp_number}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <Dialog
                    open={selectedCustomer?.uid === customer.uid}
                    onOpenChange={(open) =>
                      open
                        ? setSelectedCustomer(customer)
                        : setSelectedCustomer(null)
                    }
                  >
                    <DialogTrigger asChild>
                      <button className="rounded-full bg-purple-100 p-2 text-purple-600 transition-colors hover:bg-purple-200">
                        <Eye size={18} />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="h-[90dvh] max-w-screen-lg bg-white">
                      <DialogTitle className="sr-only">
                        {t("details.title")}
                      </DialogTitle>
                      <DialogDescription className="sr-only">
                        {t("details.title")}
                      </DialogDescription>
                      <ScrollArea className="h-full w-full p-2">
                        <CustomerDetails customerInfo={customer} />
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Table Layout */}
      <div className="mt-8 hidden md:block">
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader className="bg-sidebar/80">
              <TableRow>
                <TableHead className="text-white">
                  {t("details.name")}
                </TableHead>
                <TableHead className="text-white">
                  {t("details.email")}
                </TableHead>
                <TableHead className="text-white">
                  {t("details.phone")}
                </TableHead>
                <TableHead className="text-white">
                  {t("details.whatsapp")}
                </TableHead>
                <TableHead className="flex items-center justify-center text-white">
                  {t("details.title")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transformedCustomers.map((customer) => (
                <TableRow key={customer.uid}>
                  <TableCell className="font-medium">
                    {customer.name || "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={customer.email}>
                      {customer.email || "N/A"}
                    </div>
                  </TableCell>
                  <TableCell>{customer.phone || "N/A"}</TableCell>
                  <TableCell>{customer.whatsapp_number || "N/A"}</TableCell>
                  <TableCell className="flex items-center justify-center">
                    <Dialog
                      open={selectedCustomer?.uid === customer.uid}
                      onOpenChange={(open) =>
                        open
                          ? setSelectedCustomer(customer)
                          : setSelectedCustomer(null)
                      }
                    >
                      <DialogTrigger asChild>
                        <button className="rounded-full p-2 transition-colors hover:bg-gray-100">
                          <Eye size={20} />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="h-[90dvh] max-w-screen-lg bg-white">
                        <DialogTitle className="sr-only">
                          {t("details.title")}
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                          {t("details.title")}
                        </DialogDescription>
                        <ScrollArea className="h-full w-full p-2">
                          <CustomerDetails customerInfo={customer} />
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Empty State */}
      {transformedCustomers.length === 0 && (
        <div className="mt-8 flex flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 py-12">
          <div className="text-center">
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchQuery ? t("noSearchResults") : t("noCustomers")}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery ? t("tryDifferentSearch") : t("getStarted")}
            </p>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {paginatedData && paginatedData.count > 0 && (
        <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row sm:gap-0">
          <div className="text-sm text-gray-600">
            {t("showing")} {transformedCustomers.length} {t("of")}{" "}
            {paginatedData.count} {t("customers")}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!paginatedData.previous}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{t("previous")}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!paginatedData.next}
            >
              <span className="hidden sm:inline">{t("next")}</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
