import { FC } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2 } from "lucide-react";
import { useDeleteSingleTableMutation } from "@/redux/reducers/restaurants-reducer";
import { useTranslations } from "next-intl";

export interface TableData {
  uid: string;
  name: string;
  capacity: number;
  category: "FAMILY" | "COUPLE" | "GROUP" | "SINGLE" | "PRIVATE";
  position: string;
  status: "AVAILABLE" | "UNAVAILABLE" | "RESERVED";
}

const TableCard: FC<{ table: TableData }> = ({ table }) => {
  const { id } = useParams();
  const t = useTranslations("tables");
  const [deleteSingleTable] = useDeleteSingleTableMutation();
  const handleDeleteTable = async () => {
    await deleteSingleTable({ restaurant_id: id, table_id: table.uid });
  };

  const getCategoryLabel = (category: TableData["category"]) => {
    const key = category.toLowerCase() as "family" | "couple" | "group" | "single" | "private";
    return t(`details.category.${key}`);
  };

  const getStatusLabel = (status: TableData["status"]) => {
    const key = status.toLowerCase() as "available" | "unavailable" | "reserved";
    return t(`details.status.${key}`);
  };

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden transition-all duration-300 hover:shadow-lg">
      <CardContent className="flex flex-1 gap-4 p-4">
        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
          <Image
            src="/restaurant-demo.jpg"
            alt={table.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-primary">
                {table.name}
              </h3>
              <p className="text-xs font-medium text-muted-foreground">
                {getCategoryLabel(table.category)} {t("details.category.suffix")}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-primary/10"
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem
                  onClick={handleDeleteTable}
                  className="flex items-center gap-1.5 text-xs text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                  {t("details.actions.delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="text-xs font-medium">
              {t("details.capacity.label")}: {table.capacity} {t("details.capacity.unit")}
            </Badge>
            <Badge
              variant={
                table.status === "AVAILABLE"
                  ? "outline"
                  : table.status === "UNAVAILABLE"
                    ? "destructive"
                    : table.status === "RESERVED"
                      ? "secondary"
                      : "outline"
              }
              className="text-xs font-medium"
            >
              {getStatusLabel(table.status)}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("details.position.label")}: {table.position ? table.position : t("details.position.notSpecified")}
          </p>
        </div>
      </CardContent>
      <CardFooter className="mt-auto flex h-14 items-center justify-end gap-3 border-t bg-secondary/10 p-3">
        <Link href={`/restaurants/${id}/tables/${table.uid}`}>
          <Button
            variant="default"
            size="sm"
            className="gap-1.5 text-xs transition-colors hover:bg-primary/90"
          >
            {t("details.actions.viewDetails")}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default TableCard;
