"use client";
import {
  ArrowLeft,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import { FC, useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useGetSentLogsQuery } from "@/redux/reducers/promotions-reducer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PromotionReportsSkeleton from "@/components/pages/promotions/skeletons/promotion-reports-skeleton";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

interface PromotionReport {
  uid: string;
  client_name: string;
  client_whatsapp: string;
  status: "SENT" | "DELIVERED" | "FAILED" | "CONVERTED";
  sent_at: string;
}

const PromotionReportPage: FC = () => {
  const { uid } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const ordering = searchParams.get("ordering") || "-sent_at";
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetSentLogsQuery({
    id: uid as string,
    ordering,
    page,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [downloading, setDownloading] = useState(false);
  const t = useTranslations("promotions.reports");
  const locale = useLocale();

  // Reset to page 1 when search query changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const handleSort = () => {
    const newOrdering = ordering === "sent_at" ? "-sent_at" : "sent_at";
    router.push(`/promotions/${uid}/reports?ordering=${newOrdering}`);
  };

  const handleDownloadExcel = async () => {
    setDownloading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASEURL}/api/promotions/${uid}/sent-logs/export-excel`,
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
      a.download = `promotion-${uid}-logs.xlsx`;
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



  // Filter logs based on search term
  const filteredLogs = useMemo(() => {
    if (!data?.logs) return [];
    if (!searchTerm) return data.logs;
    const lowerQuery = searchTerm.toLowerCase();
    return data.logs.filter(
      (log: PromotionReport) =>
        log.client_name.toLowerCase().includes(lowerQuery) ||
        log.client_whatsapp.includes(lowerQuery),
    );
  }, [data?.logs, searchTerm]);

  // Pagination
  const pageSize = 10;
  const totalPages = Math.ceil(filteredLogs.length / pageSize);
  const paginatedLogs = filteredLogs.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  if (isLoading) {
    return <PromotionReportsSkeleton />;
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="relative h-32 w-full rounded-t-lg bg-gradient-to-b from-sidebar-accent to-sidebar">
        <div className="absolute left-4 top-4 z-10">
          <button
            onClick={() => window.history.back()}
            className="rounded-full bg-white/20 p-2 transition-all hover:bg-white/30"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-sidebar/30 p-4 backdrop-blur-sm">
          <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
        </div>
      </div>

      {/* Stats Section */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow">
          <h3 className="text-sm font-medium text-gray-500">
            {t("totalSent")}
          </h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {data?.total_send}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <h3 className="text-sm font-medium text-gray-500">
            {t("delivered")}
          </h3>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {data?.total_delivered}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <h3 className="text-sm font-medium text-gray-500">{t("failed")}</h3>
          <p className="mt-2 text-3xl font-bold text-red-600">
            {data?.total_failed}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <h3 className="text-sm font-medium text-gray-500">
            {t("converted")}
          </h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {data?.total_converted}
          </p>
        </div>
      </div>

      {/* Search and Table Section */}
      <div className="mt-8">
        <div className="mb-4 flex w-full items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader className="bg-sidebar/80 hover:bg-sidebar/80">
              <TableRow>
                <TableHead className="text-white">
                  {t("table.clientName")}
                </TableHead>
                <TableHead className="text-white">
                  {t("table.whatsapp")}
                </TableHead>
                <TableHead className="text-white">
                  {t("table.status")}
                </TableHead>
                <TableHead className="text-center text-white">
                  <Button
                    variant="ghost"
                    onClick={handleSort}
                    className="text-white hover:text-white/80"
                  >
                    {t("table.sentAt")}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLogs.map((log: PromotionReport) => (
                <TableRow key={log.uid}>
                  <TableCell className="font-medium">
                    {log.client_name}
                  </TableCell>
                  <TableCell>{log.client_whatsapp}</TableCell>
                  <TableCell>
                    <span
                      className={` ${log.status === "DELIVERED" && "text-green-600"} ${log.status === "SENT" && "text-yellow-600"} ${log.status === "FAILED" && "text-red-600"} ${log.status === "CONVERTED" && "text-blue-600"} `}
                    >
                      {locale === "de"
                        ? log.status === "SENT"
                          ? "GESENDET"
                          : log.status === "DELIVERED"
                          ? "ZUGESTELLT"
                          : log.status === "FAILED"
                          ? "FEHLGESCHLAGEN"
                          : log.status === "CONVERTED"
                          ? "KONVERTIERT"
                          : log.status
                        : log.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {locale === "de"
                      ? new Date(log.sent_at).toLocaleString("de-DE", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second:"2-digit"
                        })
                      : new Date(log.sent_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {filteredLogs.length > 0 && (
          <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row sm:gap-0">
            <div className="text-sm text-gray-600">
              {t("showing")} {(page - 1) * pageSize + 1} -{" "}
              {Math.min(page * pageSize, filteredLogs.length)} {t("of")}{" "}
              {filteredLogs.length} {t("results")}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">{t("previous")}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages}
              >
                <span className="hidden sm:inline">{t("next")}</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredLogs.length === 0 && (
          <div className="mt-8 flex flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 py-12">
            <div className="text-center">
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm ? t("noSearchResults") : t("noLogs")}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? t("tryDifferentSearch") : t("noLogsDescription")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromotionReportPage;
