/* eslint-disable react-hooks/exhaustive-deps */
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useParams } from "next/navigation";
import {
  useGetSingleRestaurantMenuQuery,
  useUpdateSingleMenuMutation,
} from "@/redux/reducers/restaurants-reducer";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

const MenuCategory = {
  STARTERS: "STARTERS",
  MAIN_COURSES: "MAIN_COURSES",
  DESSERTS: "DESSERTS",
  DRINKS_ALCOHOLIC: "DRINKS_ALCOHOLIC",
  DRINKS_NON_ALCOHOLIC: "DRINKS_NON_ALCOHOLIC",
  SPECIALS: "SPECIALS",
} as const;

const Classification = {
  MEAT: "MEAT",
  FISH: "FISH",
  VEGETARIAN: "VEGETARIAN",
  VEGAN: "VEGAN",
} as const;

const MAX_COMBINATIONS = 5;

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().optional(),
  price: z.number().min(0, { message: "Negative price is not allowed" }).optional(),
  ingredients: z
    .record(z.string(), z.string())
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one ingredient is required",
    }),
  category: z.enum(Object.values(MenuCategory)).optional(),
  classification: z.enum(Object.values(Classification)).optional(),
  upselling_priority: z.number().min(1).max(5).int().optional(),
  enable_upselling: z.boolean().optional(),
  recommended_combinations: z
    .array(z.string())
    .max(MAX_COMBINATIONS, {
      message: `Maximum ${MAX_COMBINATIONS} combinations allowed`,
    })
    .optional(),
});

type MenuFormData = z.infer<typeof formSchema>;

interface MenuItemData {
  uid: string;
  image: string;
  name: string;
  description: string;
  price: string;
  ingredients: Record<string, string>;
  category: keyof typeof MenuCategory;
  classification: keyof typeof Classification;
  allergens: string[];
  macronutrients: string;
  upselling_priority: number;
  enable_upselling: boolean;
  recommended_combinations: (string | { uid: string; name: string })[];
}

interface SelectedCombination {
  uid: string;
  name: string;
  category: string;
}

interface UpdateMenuProps {
  onClose: () => void;
  initialData: MenuItemData;
}

export const UpdateMenu = ({ onClose, initialData }: UpdateMenuProps) => {
  const t = useTranslations("restaurants.menu.form");
  const [ingredients, setIngredients] = useState<Record<string, string>>(
    initialData.ingredients || {},
  );
  const [ingredientName, setIngredientName] = useState("");
  const [ingredientAmount, setIngredientAmount] = useState("");
  const [selectedCombinations, setSelectedCombinations] = useState<
    SelectedCombination[]
  >([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  const { data: menu, isLoading } = useGetSingleRestaurantMenuQuery(id);
  const [updateSingleMenu, { isLoading: updateLoading }] =
    useUpdateSingleMenuMutation();

  const form = useForm<MenuFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData.name,
      description: initialData.description,
      price: parseFloat(initialData.price),
      category: initialData.category,
      classification: initialData.classification,
      enable_upselling: initialData.enable_upselling,
      upselling_priority: initialData.upselling_priority,
      ingredients: initialData.ingredients,
      recommended_combinations:
        initialData.recommended_combinations?.map((item) =>
          typeof item === "string" ? item : item.uid,
        ) || [],
    },
  });

  // Initialize selectedCombinations from initialData
  useEffect(() => {


    const initialCombinations: SelectedCombination[] = [];

    if (initialData.recommended_combinations?.length) {
      initialCombinations.push(
        ...initialData.recommended_combinations.map((item) => {
          const itemUid = typeof item === "string" ? item : item.uid;
          const itemName = typeof item === "string" ? undefined : item.name;
          const menuItem = menu?.results?.find(
            (menuItem: MenuItemData) => menuItem.uid === itemUid,
          );
          return {
            uid: itemUid,
            name: menuItem?.name || itemName || `Item ${itemUid}`,
            category: menuItem?.category || initialData.category || "UNKNOWN",
          };
        }),
      );
    }


    // Only update state if different to avoid infinite loops
    if (
      JSON.stringify(initialCombinations) !==
      JSON.stringify(selectedCombinations)
    ) {
      setSelectedCombinations(initialCombinations);
      form.setValue(
        "recommended_combinations",
        initialCombinations.map((item) => item.uid),
      );
    }
  }, [
    initialData.recommended_combinations,
    menu?.results,
    form,
    initialData.category,
  ]);

  const name = form.watch("name");
  const ingredientsField = form.watch("ingredients");
  const selectedCategory = form.watch("category");
  const enableUpselling = form.watch("enable_upselling");

  const isSubmitDisabled = !name || Object.keys(ingredientsField).length === 0;

  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (ingredientName && ingredientAmount) {
      const updatedIngredients = {
        ...ingredients,
        [ingredientName]: ingredientAmount,
      };
      setIngredients(updatedIngredients);
      form.setValue("ingredients", updatedIngredients);
      setIngredientName("");
      setIngredientAmount("");
    }
  };

  const removeIngredient = (ingredientName: string) => {
    const updatedIngredients = { ...ingredients };
    delete updatedIngredients[ingredientName];
    setIngredients(updatedIngredients);
    form.setValue("ingredients", updatedIngredients);
  };

  const groupedItems = useMemo(() => {
    if (!menu?.results) return {};

    const filteredItems = menu.results.filter(
      (item: MenuItemData) =>
        item.category !== selectedCategory &&
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selectedCombinations.some((combo) => combo.uid === item.uid),
    );

    return filteredItems.reduce(
      (acc: { [key: string]: MenuItemData[] }, item: MenuItemData) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
      },
      {},
    );
  }, [searchTerm, selectedCombinations, menu?.results, selectedCategory]);

  const handleSelect = (item: MenuItemData) => {
    if (selectedCombinations.length >= MAX_COMBINATIONS) {
      toast.error(t("combinations.maxSelected", { max: MAX_COMBINATIONS }));
      return;
    }

    const newCombination = {
      uid: item.uid,
      name: item.name,
      category: item.category,
    };
    const newValues = [...selectedCombinations, newCombination];
    setSelectedCombinations(newValues);
    form.setValue(
      "recommended_combinations",
      newValues.map((item) => item.uid),
    );
    setOpen(false);
  };

  const handleRemove = (uid: string) => {
    const newValues = selectedCombinations.filter((item) => item.uid !== uid);
    setSelectedCombinations(newValues);
    form.setValue(
      "recommended_combinations",
      newValues.map((item) => item.uid),
    );
  };

  const onSubmit = async (data: MenuFormData) => {
    if (id && initialData.uid) {
      try {
        const response = await updateSingleMenu({
          restaurant_id: id,
          menu_id: initialData.uid,
          data: {
            ...data,
            recommended_combinations: selectedCombinations.map(
              (item) => item.uid,
            ),
          },
        }).unwrap();

        if (response) {
          toast.success(t("submit.success"));
          onClose();
        }
      } catch (error) {
        toast.error(t("submit.error"));
        console.error("Error updating menu:", error);
      }
    }
  };

  if (isLoading) {
    return <div>{t("submit.loading")}</div>;
  }

  return (
    <div>
      <CardContent className="space-y-4 pt-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t("update.label")}</h2>
          <p className="text-sm text-gray-600">{t("update.description")}</p>
        </div>
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("name.label")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("name.placeholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("menuDescription.label")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("menuDescription.placeholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("price.label")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        onWheel={(e) => e.currentTarget.blur()}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
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
                    <FormLabel>{t("category.label")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("category.placeholder")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(MenuCategory).map(([key, value]) => (
                          <SelectItem key={key} value={value}>
                            {t(`category.options.${key
                              .split("_")
                              .map((w, i) =>
                                i === 0 ? w.toLowerCase() : w.charAt(0) + w.slice(1).toLowerCase(),
                              )
                              .join("")}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="classification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("classification.label")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("classification.placeholder")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(Classification).map(([key, value]) => (
                          <SelectItem key={key} value={value}>
                            {t(`classification.options.${key.toLowerCase()}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>{t("ingredients.label")}</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder={t("ingredients.namePlaceholder")}
                        value={ingredientName}
                        onChange={(e) => setIngredientName(e.target.value)}
                      />
                      <Input
                        placeholder={t("ingredients.amountPlaceholder")}
                        value={ingredientAmount}
                        onChange={(e) => setIngredientAmount(e.target.value)}
                      />
                      <Button
                        type="button"
                        onClick={(e) => {
                          if (!/\d+[a-zA-Z]+$/.test(ingredientAmount.trim())) {
                            toast.error(t("ingredients.invalidAmount"));
                            return;
                          }
                          handleAddIngredient(e);
                        }}
                      >
                        {t("ingredients.addButton")}
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(ingredients).map(([name, amount]) => (
                        <Badge key={name} variant="secondary">
                          {name}: {amount}
                          <button
                            type="button"
                            onClick={() => removeIngredient(name)}
                            className="ml-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>

              <FormField
                control={form.control}
                name="enable_upselling"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{t("upselling.enable")}</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              {enableUpselling && (
                <FormField
                  control={form.control}
                  name="upselling_priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("upselling.priority.label")}</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(parseInt(value))
                          }
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t("upselling.priority.placeholder")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormItem>
                <FormLabel>
                  {t("combinations.maxLabel", { max: MAX_COMBINATIONS })}
                </FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          disabled={
                            selectedCombinations.length >= MAX_COMBINATIONS
                          }
                        >
                          {selectedCombinations.length >= MAX_COMBINATIONS
                            ? t("combinations.maxSelected", {
                                max: MAX_COMBINATIONS,
                              })
                            : t("combinations.placeholder")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0">
                        <Command>
                          <CommandInput
                            placeholder={t("combinations.search")}
                            value={searchTerm}
                            onValueChange={setSearchTerm}
                          />
                          <CommandEmpty>
                            {t("combinations.noResults")}
                          </CommandEmpty>
                          {Object.entries(groupedItems).map(
                            ([category, items]) => (
                              <CommandGroup
                                key={category}
                                heading={
                                  <span className="font-bold text-black">
                                    {t(`category.options.${category
                                      .split("_")
                                      .map((w, i) =>
                                        i === 0 ? w.toLowerCase() : w.charAt(0) + w.slice(1).toLowerCase(),
                                      )
                                      .join("")}`)}
                                  </span>
                                }
                              >
                                {(items as MenuItemData[]).map((item) => (
                                  <CommandItem
                                    key={item.uid}
                                    onSelect={() => handleSelect(item)}
                                  >
                                    {item.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            ),
                          )}
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <div className="flex flex-wrap gap-2">
                      {selectedCombinations.map((item) => (
                        <Badge key={item.uid} variant="secondary">
                          {item.name} (
                          {t(`category.options.${item.category
                            .split("_")
                            .map((w, i) =>
                              i === 0 ? w.toLowerCase() : w.charAt(0) + w.slice(1).toLowerCase(),
                            )
                            .join("")}`)}
                          )
                          <button
                            type="button"
                            onClick={() => handleRemove(item.uid)}
                            className="ml-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>

              <div className="flex items-center justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitDisabled || updateLoading}
                >
                  {updateLoading ? t("update.loading") : t("update.label")}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </CardContent>
    </div>
  );
};
