"use client";

import {
  Plus,
  UtensilsCrossed,
  ArrowLeft,
  Upload,
  X,
  FileText,
  Download,
  File,
  Trash2,
} from "lucide-react";
import { FC, useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import MenuCard from "@/components/pages/restaurants/cards/menu-card";
import {
  useDeleteMenuPdfMutation,
  useGetMenuPdfQuery,
  useGetSingleRestaurantMenuQuery,
  useUploadNewMenuPdfMutation,
} from "@/redux/reducers/restaurants-reducer";
import { useParams, useRouter } from "next/navigation";
import { AddNewMenu } from "@/components/pages/restaurants/modals/add-new-menu";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface PDFManagementProps {
  onClose: () => void;
  resturant_id: string;
  pdfFileLink?: string;
  pdfFileUid?: string;
  hasPdf: boolean;
}
const PDFManagement: FC<PDFManagementProps> = ({
  onClose,
  resturant_id,
  pdfFileLink,
  pdfFileUid,
  hasPdf,
}) => {
  const t = useTranslations("restaurants.menu");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [showUploadSection, setShowUploadSection] = useState(!hasPdf);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadNewMenuPdf, { isLoading: isUploading }] =
    useUploadNewMenuPdfMutation();
  const [deleteMenuPdf, { isLoading: isDeleting }] = useDeleteMenuPdfMutation();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFile = useCallback((file: File): boolean => {
    if (file.type !== "application/pdf") {
      setUploadError(t("pdf.upload.error.fileType"));
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError(t("pdf.upload.error.fileSize"));
      return false;
    }

    setUploadError("");
    return true;
  }, [t]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  }, [validateFile]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (validateFile(file)) {
          setSelectedFile(file);
        }
      }
    },
    [validateFile],
  );

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError(t("pdf.upload.error.noFile"));
      return;
    }

    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("menu_type", "pdf");

      const response = await uploadNewMenuPdf({
        id: resturant_id,
        data: formData,
      });

      if (!response.data) {
        toast.error(t("pdf.upload.error.generic"));
        return;
      }

      toast.success(t("pdf.upload.success"));
      onClose();
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadError(t("pdf.upload.error.generic"));
    }
  };

  const handleDownloadPdf = async () => {
    if (!pdfFileLink) {
      toast.error(t("pdf.manage.error.noFile"));
      return;
    }

    try {
      const response = await fetch(pdfFileLink, { mode: "cors" });
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const fileName = pdfFileLink.split("/").pop() || "menu.pdf";
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(t("pdf.manage.success.download"));
    } catch (error) {
      console.error("Download failed:", error);
      toast.error(t("pdf.manage.error.download"));
    }
  };

  const handleDeletePdf = async () => {
    try {
      await deleteMenuPdf({
        id: resturant_id,
        uid: pdfFileUid,
      });

      toast.success(t("pdf.manage.success.delete"));
      onClose();
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error(t("pdf.manage.error.delete"));
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <h3 className="mb-4 text-lg font-semibold">{t("pdf.manage.title")}</h3>

      {showUploadSection ? (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div
            className={`relative mb-4 flex h-48 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : selectedFile
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={!selectedFile ? handleBrowseClick : undefined}
          >
            {selectedFile ? (
              <div className="flex flex-col items-center gap-2 text-center">
                <FileText className="h-12 w-12 text-green-600" />
                <p className="text-sm font-medium text-green-700">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-green-600">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile();
                  }}
                  className="mt-2"
                >
                  <X className="mr-1 h-3 w-3" />
                  Remove
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center">
                <Upload
                  className={`h-10 w-10 ${isDragging ? "text-blue-500" : "text-gray-400"}`}
                />
                <p className="text-sm font-medium">
                  {isDragging ? "Drop PDF here" : t("pdf.upload.description")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("pdf.upload.button")}
                </p>
              </div>
            )}
          </div>

          {uploadError && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
              {uploadError}
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
            {hasPdf && (
              <Button
                variant="outline"
                onClick={() => setShowUploadSection(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="w-full bg-primary text-white hover:bg-primary/90 sm:w-auto"
            >
              {isUploading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  {hasPdf ? t("pdf.manage.update") + "..." : t("pdf.upload.button") + "..."}
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {hasPdf ? t("pdf.manage.update") : t("pdf.upload.button")}
                </>
              )}
            </Button>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-10 w-10 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {t("pdf.manage.title")}
                </p>
                <p className="text-xs text-gray-500">
                  {pdfFileLink?.split("/").pop() || "menu.pdf"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={() => setShowUploadSection(true)}
              className="flex-1 bg-primary text-white hover:bg-primary/90"
            >
              <Upload className="mr-2 h-4 w-4" />
              {t("pdf.manage.update")}
            </Button>
            <Button
              onClick={handleDownloadPdf}
              variant="outline"
              className="flex-1"
            >
              <Download className="mr-2 h-4 w-4" />
              {t("pdf.manage.download")}
            </Button>
            <Button
              onClick={handleDeletePdf}
              disabled={isDeleting}
              variant="outline"
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
            >
              {isDeleting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("pdf.manage.delete")}
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const MenuPage: FC = () => {
  const t = useTranslations("restaurants.menu");
  const { id } = useParams();
  const router = useRouter();
  const { data: menu, isLoading } = useGetSingleRestaurantMenuQuery(id);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const { data } = useGetMenuPdfQuery(id);

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleClosePdfModal = () => {
    setIsPdfModalOpen(false);
  };

  const pdfFileLink = data?.results?.[0]?.file;
  const pdfFileUid = data?.results?.[0]?.uid;
  const hasPdf = data?.count > 0;

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 flex items-start justify-between gap-4 lg:mb-8 lg:flex-row lg:items-center">
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
        <div className="flex items-center gap-4">
          <div>
            <Dialog open={isPdfModalOpen} onOpenChange={setIsPdfModalOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center justify-center gap-0 bg-primary text-white hover:bg-primary/90 sm:gap-2">
                  <File className="h-4 w-4 sm:mr-2" />
                  <span className="hidden lg:block">{t("pdf.menuPdf")}</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-screen-lg ">
                <DialogTitle className="sr-only">{t("pdf.menuPdf")}</DialogTitle>
                <DialogDescription className="sr-only">
                  {t("pdf.menuPdfDescription")}
                </DialogDescription>
                {/* <ScrollArea className="h-full w-full"> */}
                  <PDFManagement
                    resturant_id={id as string}
                    onClose={handleClosePdfModal}
                    pdfFileLink={pdfFileLink}
                    pdfFileUid={pdfFileUid}
                    hasPdf={hasPdf}
                  />
                {/* </ScrollArea> */}
              </DialogContent>
            </Dialog>
          </div>
          <div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center justify-center gap-0 bg-primary text-white hover:bg-primary/90 sm:gap-2">
                  <Plus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden lg:block">{t("addNewItem")}</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="h-[90dvh] max-w-screen-md">
                <DialogTitle className="sr-only">{t("addNewItem")}</DialogTitle>
                <DialogDescription className="sr-only">
                  {t("addNewDescription")}
                </DialogDescription>
                <ScrollArea className="h-full w-full p-2">
                  <AddNewMenu onClose={handleCloseDialog} />
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-14rem)]">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {isLoading ? (
            <>
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="h-32 animate-pulse rounded-lg bg-muted"
                />
              ))}
            </>
          ) : !menu?.results || menu.results.length === 0 ? (
            <div className="col-span-2 mt-16 flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
              <UtensilsCrossed className="h-12 w-12" />
              <p className="text-lg">{t("noItems")}</p>
            </div>
          ) : (
            menu.results.map((menuItem: MenuItemData) => (
              <MenuCard key={menuItem.uid} menuItem={menuItem} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

interface MenuItemData {
  uid: string;
  image: string;
  name: string;
  description: string;
  price: string;
  ingredients: string[];
  category:
    | "STARTERS"
    | "MAIN_COURSES"
    | "DESSERTS"
    | "DRINKS_ALCOHOLIC"
    | "DRINKS_NON_ALCOHOLIC"
    | "SPECIALS";
  classification: "MEAT" | "FISH" | "VEGETARIAN" | "VEGAN" | "NEUTRAL";
  allergens: string[];
  macronutrients: string;
  upselling_priority: number;
  enable_upselling: boolean;
  recommended_combinations: string[];
}

export default MenuPage;
