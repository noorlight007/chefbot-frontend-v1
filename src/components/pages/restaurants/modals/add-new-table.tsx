import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAddNewTableMutation } from "@/redux/reducers/restaurants-reducer";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

const formSchema = z.object({
  name: z.string().min(1, { message: "Table name is required" }),
  capacity: z
    .number()
    .min(1, { message: "Minimum capacity is 1" })
    .max(32767, { message: "Maximum capacity exceeded" }),
  category: z.enum(["FAMILY", "COUPLE", "SINGLE", "GROUP", "PRIVATE"]),
  position: z.string().min(1, { message: "Position is required" }),
  status: z.enum(["AVAILABLE", "UNAVAILABLE", "RESERVED"]),
});

type TableFormData = z.infer<typeof formSchema>;

interface AddNewTableProps {
  onClose: () => void;
}

const AddNewTable: React.FC<AddNewTableProps> = ({ onClose }) => {
  const t = useTranslations("tables");
  const { id } = useParams();
  const [addNewTable, { isLoading }] = useAddNewTableMutation();

  const form = useForm<TableFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "AVAILABLE",
      category: "FAMILY",
    },
  });

  const onSubmitHandler = async (data: TableFormData) => {
    const res = await addNewTable({ id, data });
    if (res.data) {
      toast.success(t("addNewSuccess"));
      onClose();
    } else if (res.error && "data" in res.error && res.error.data) {
      // Show backend validation errors in toast
      const errorData = res.error.data;
      if (errorData && typeof errorData === "object" && "name" in errorData && Array.isArray(errorData.name)) {
        toast.error((errorData as { name?: string[] }).name?.join(", ") || t("addNewError"));
      } else if (typeof errorData === "string") {
        toast.error(errorData);
      } else {
        toast.error(t("addNewError"));
      }
    }
  };

  return (
    <div>
      <div className="px-4">
        <h2 className="mb-4 text-xl font-semibold">{t("addNew")}</h2>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmitHandler)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("details.name.label")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("details.name.placeholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("details.capacity.label")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      onWheel={(e) => e.currentTarget.blur()}
                      placeholder={t("details.capacity.placeholder")}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("details.category.label")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("details.category.placeholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="FAMILY">{t("details.category.family")}</SelectItem>
                      <SelectItem value="COUPLE">{t("details.category.couple")}</SelectItem>
                      <SelectItem value="SINGLE">{t("details.category.single")}</SelectItem>
                      <SelectItem value="GROUP">{t("details.category.group")}</SelectItem>
                      <SelectItem value="PRIVATE">{t("details.category.private")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("details.position.label")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("details.position.placeholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("details.status.label")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("details.status.placeholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="AVAILABLE">{t("details.status.available")}</SelectItem>
                      <SelectItem value="UNAVAILABLE">{t("details.status.unavailable")}</SelectItem>
                      <SelectItem value="RESERVED">{t("details.status.reserved")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-6 flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                {t("details.actions.cancel")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? t("adding") : t("details.actions.add")}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AddNewTable;
