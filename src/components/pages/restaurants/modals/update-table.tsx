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
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useUpdateSingleTableMutation } from "@/redux/reducers/restaurants-reducer";
import { useTranslations } from "next-intl";


// Define the form schema
const formSchema = z.object({
  uid: z.string(),
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

interface UpdateTableProps {
  onClose: () => void;
  table: TableFormData;
}

const UpdateTable: React.FC<UpdateTableProps> = ({ onClose, table }) => {
  const t = useTranslations("tables");
  const { id } = useParams();
  const [updateSingleTable, { isLoading }] = useUpdateSingleTableMutation();

  // Initialize the form with default values
  const form = useForm<TableFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      uid: table.uid,
      name: table.name,
      capacity: table.capacity,
      category: table.category,
      position: table.position,
      status: table.status,
    },
  });

  // Handle form submission
  const onSubmitHandler = async (data: TableFormData) => {
    try {
      const res = await updateSingleTable({
        restaurant_id: id as string,
        table_id: table.uid,
        data,
      });
      if (res.data) {
        toast.success(t("addNewSuccess"));
        onClose();
      }
    } catch (error) {
      toast.error(t("addNewError"));
      console.error("Update table error:", error);
    }
  };

  return (
    <div>
      <div className="px-4">
        <h2 className="mb-4 text-xl font-semibold">{t("details.title")}</h2>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmitHandler)}
            className="space-y-4"
          >
            {/* Hidden uid field (if not editable) */}
            <input type="hidden" {...form.register("uid")} />

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
                      placeholder={t("details.capacity.placeholder")}
                      value={field.value ?? ""} // Handle undefined/null values
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value ? parseInt(value) : undefined); // Handle empty input
                      }}
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
                {isLoading ? t("adding") : t("details.actions.edit")}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default UpdateTable;
