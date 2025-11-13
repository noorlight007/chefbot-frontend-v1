"use client";
import { useGetWhatsappBotClientsQuery } from "@/redux/reducers/whatsapp-reducer";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslations } from "next-intl";
import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ContactsSkeleton } from "@/components/pages/chatbots/skeletons/contacts-skeleton";

interface Client {
  uid: string;
  name: string;
  whatsapp_number: string;
  last_message: string | null;
  last_message_sent_at: string | null;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

const ContactPage: React.FC = () => {
  const { uid } = useParams();
  const router = useRouter();
  const [page, setPage] = useState(0);
  const { data, isLoading } = useGetWhatsappBotClientsQuery({ uid, page });

  const paginatedData = data as PaginatedResponse<Client> | undefined;
  const clients: Client[] = useMemo(
    () => paginatedData?.results || [],
    [paginatedData?.results],
  );
  const t = useTranslations("chatbots.contacts");

  const [searchQuery, setSearchQuery] = useState("");
  const [downloading, setDownloading] = useState(false);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setPage(0);
  }, [searchQuery]);

  const transformedClients = useMemo(() => {
    const list = clients.map((client) => ({ ...client }));
    if (!searchQuery) return list;
    const lower = searchQuery.toLowerCase();
    return list.filter(
      (c) =>
        c.name?.toLowerCase().includes(lower) ||
        c.whatsapp_number?.toLowerCase().includes(lower) ||
        (c.last_message && c.last_message.toLowerCase().includes(lower)),
    );
  }, [clients, searchQuery]);

  const handleDownloadExcel = async () => {
    setDownloading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASEURL}/api/whatsapp/${uid}/clients/export-excel`,
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
      a.download = `contacts-${uid}.xlsx`;
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
    return <ContactsSkeleton />;
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

        {/* Search & Download */}
        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder={t("searchPlaceholder") || "Search contacts..."}
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

      {/* Desktop Table Layout */}
      <div className="mt-8 block">
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader className="bg-sidebar/80">
              <TableRow>
                <TableHead className="text-white">{t("name")}</TableHead>
                <TableHead className="text-center text-white">
                  {t("number")}
                </TableHead>
                <TableHead className="text-center text-white">
                  {t("lastMessage")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transformedClients.map((client) => (
                <TableRow key={client.uid}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell className="text-center">
                    {client.whatsapp_number}
                  </TableCell>
                  <TableCell>
                    <div
                      className="max-w-xs truncate text-center"
                      title={client.last_message ?? ""}
                    >
                      {client.last_message ?? "N/A"}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Empty State */}
      {transformedClients.length === 0 && (
        <div className="mt-8 flex flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 py-12">
          <div className="text-center">
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchQuery ? t("noSearchResults") : t("noContacts")}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery
                ? t("tryDifferentSearch")
                : t("noContactsDescription")}
            </p>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {paginatedData && paginatedData.count > 0 && (
        <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row sm:gap-0">
          <div className="text-sm text-gray-600">
            {t("showing")} {transformedClients.length} {t("of")}{" "}
            {paginatedData.count} {t("contacts")}
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
};

export default ContactPage;
