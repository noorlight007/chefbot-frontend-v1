import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, X, ClipboardPaste } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  useAddNewMenuMutation,
  useGetSingleRestaurantMenuQuery,
} from "@/redux/reducers/restaurants-reducer";
import { toast } from "sonner";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";

const MAX_COMBINATIONS = 5;

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().optional(),
  price: z.number().min(0, { message: "Price must be positive" }).optional(),
  ingredients: z
    .record(z.string(), z.string())
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one ingredient is required",
    }),
  category: z
    .enum([
      "STARTERS",
      "MAIN_COURSES",
      "DESSERTS",
      "DRINKS_ALCOHOLIC",
      "DRINKS_NON_ALCOHOLIC",
      "SPECIALS",
    ])
    .optional(),
  classification: z.enum(["MEAT", "FISH", "VEGETARIAN", "VEGAN"]).optional(),
  upselling_priority: z.number().min(1).max(5).int(),
  enable_upselling: z.boolean().optional(),
  recommended_combinations: z
    .array(z.string())
    .max(MAX_COMBINATIONS, `Maximum ${MAX_COMBINATIONS} combinations allowed`)
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
  category: string;
  classification: string;
  allergens: string[];
  macronutrients: string;
  upselling_priority: number;
  enable_upselling: boolean;
  recommended_combinations: number[];
}

interface SelectedCombination {
  uid: string;
  name: string;
}

interface CategoryOption {
  value: string;
  label: string;
}

export const AddNewMenu = ({ onClose }: { onClose: () => void }) => {
  const t = useTranslations("restaurants.menu.form");
  const [ingredients, setIngredients] = useState<Record<string, string>>({});
  const [ingredientPasteText, setIngredientPasteText] = useState("");
  const [selectedCombinations, setSelectedCombinations] = useState<
    SelectedCombination[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const { id } = useParams();
  const [addNewMenu, { isLoading: addLoading }] = useAddNewMenuMutation();
  const { data: menu, isLoading } = useGetSingleRestaurantMenuQuery(id);

  const categoryOptions: CategoryOption[] = [
    { value: "STARTERS", label: t("category.options.starters") },
    { value: "MAIN_COURSES", label: t("category.options.mainCourses") },
    { value: "DESSERTS", label: t("category.options.desserts") },
    { value: "DRINKS_ALCOHOLIC", label: t("category.options.drinksAlcoholic") },
    {
      value: "DRINKS_NON_ALCOHOLIC",
      label: t("category.options.drinksNonAlcoholic"),
    },
    { value: "SPECIALS", label: t("category.options.specials") },
  ];

  const [filteredCategories, setFilteredCategories] =
    useState<CategoryOption[]>(categoryOptions);

  useEffect(() => {
    if (categorySearchTerm) {
      const filtered = categoryOptions.filter((category) =>
        category.label.toLowerCase().includes(categorySearchTerm.toLowerCase()),
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categoryOptions);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorySearchTerm]);

  const form = useForm<MenuFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "STARTERS",
      classification: "MEAT",
      enable_upselling: false,
      upselling_priority: 1,
      ingredients: {},
      recommended_combinations: [],
    },
    mode: "onChange",
  });

  const name = form.watch("name");
  const ingredientsField = form.watch("ingredients");

  const isSubmitDisabled = !name || Object.keys(ingredientsField).length === 0;

  const handlePasteIngredients = () => {
    if (!ingredientPasteText.trim()) {
      toast.error("Please enter ingredients to paste");
      return;
    }

    try {
      // Split by comma and process each ingredient
      const ingredientPairs = ingredientPasteText
        .split(",")
        .map((pair) => pair.trim());
      const newIngredients = { ...ingredients };
      let addedCount = 0;
      let errorCount = 0;

      ingredientPairs.forEach((pair) => {
        if (!pair) return;

        // Split by colon to separate name and amount
        const colonIndex = pair.indexOf(":");
        if (colonIndex === -1) {
          errorCount++;
          return;
        }

        const name = pair.substring(0, colonIndex).trim();
        const amount = pair.substring(colonIndex + 1).trim();

        // Validate format (amount should contain number and unit)
        if (!name || !amount || !/\d+[a-zA-Z]+$/.test(amount)) {
          errorCount++;
          return;
        }

        newIngredients[name] = amount;
        addedCount++;
      });

      if (addedCount > 0) {
        setIngredients(newIngredients);
        form.setValue("ingredients", newIngredients);
        setIngredientPasteText("");
        toast.success(
          `Added ${addedCount} ingredient${addedCount > 1 ? "s" : ""}`,
        );

        if (errorCount > 0) {
          toast.warning(
            `${errorCount} ingredient${errorCount > 1 ? "s" : ""} skipped due to invalid format`,
          );
        }
      } else {
        toast.error(
          "No valid ingredients found. Use format: name:amount (e.g., rice:10g)",
        );
      }
    } catch {
      toast.error(
        "Failed to parse ingredients. Use format: name:amount,name:amount",
      );
    }
  };

  const removeIngredient = (ingredientName: string) => {
    const updatedIngredients = { ...ingredients };
    delete updatedIngredients[ingredientName];
    setIngredients(updatedIngredients);
    form.setValue("ingredients", updatedIngredients);
  };

  const onSubmit = async (data: MenuFormData) => {
    try {
      const formData = {
        ...data,
        recommended_combinations: selectedCombinations.map((item) => item.uid),
      };
      const res = await addNewMenu({ id, data: formData });

      if (res.data) {
        toast.success("Menu item added successfully");
        onClose();
      } else if (
        "error" in res &&
        typeof res.error === "object" &&
        res.error !== null &&
        "data" in res.error &&
        typeof res.error.data === "object" &&
        res.error.data !== null &&
        "name" in res.error.data
      ) {
        toast.error("Menu item already exists");
      }
    } catch {
      toast.error("Failed to add menu item");
    }
  };

  const selectedCategory = form.watch("category");

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
      toast.error(t("combinations.maxLabel", { max: MAX_COMBINATIONS }));
      return;
    }

    const newCombination = {
      uid: item.uid,
      name: item.name,
    };
    const newValues = [...selectedCombinations, newCombination];
    setSelectedCombinations(newValues);
    form.setValue(
      "recommended_combinations",
      newValues.map((item) => item.uid),
    );
    setIsDropdownOpen(false);
    setSearchTerm("");
  };

  const handleRemove = (uid: string) => {
    const newValues = selectedCombinations.filter((item) => item.uid !== uid);
    setSelectedCombinations(newValues);
    form.setValue(
      "recommended_combinations",
      newValues.map((item) => item.uid),
    );
  };

  const enableUpselling = form.watch("enable_upselling");

  const getCategoryLabel = (categoryValue: string): string => {
    const category = categoryOptions.find((cat) => cat.value === categoryValue);
    return category ? category.label : categoryValue.replace(/_/g, " ");
  };

  if (isLoading) {
    return <div>{t("submit.loading")}</div>;
  }

  return (
    <div>
      <CardContent className="space-y-4 pt-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t("title")}</h2>
          <p className="text-sm text-gray-600">{t("description")}</p>
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
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                        onWheel={(e) => e.currentTarget.blur()}
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
                    <FormControl>
                      <div className="relative">
                        <Button
                          type="button"
                          variant="outline"
                          className={`h-10 w-full justify-between text-left ${
                            form.formState.errors.category
                              ? "border-red-500"
                              : "border-gray-200"
                          } bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          onClick={() =>
                            setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                          }
                        >
                          <span className="truncate">
                            {field.value
                              ? categoryOptions.find(
                                  (category) => category.value === field.value,
                                )?.label
                              : t("category.placeholder")}
                          </span>
                          <svg
                            className="ml-2 h-4 w-4 shrink-0 opacity-50"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </Button>
                        {isCategoryDropdownOpen && (
                          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
                            <div className="p-2">
                              <Input
                                placeholder={t("category.search")}
                                value={categorySearchTerm}
                                onChange={(e) =>
                                  setCategorySearchTerm(e.target.value)
                                }
                                className="w-full"
                              />
                            </div>
                            {filteredCategories.length === 0 && (
                              <div className="p-2 text-sm text-gray-500">
                                {t("category.noResults")}
                              </div>
                            )}
                            {filteredCategories.map((category) => (
                              <div
                                key={category.value}
                                className="cursor-pointer px-4 py-2 text-sm hover:bg-gray-100"
                                onClick={() => {
                                  field.onChange(category.value);
                                  setIsCategoryDropdownOpen(false);
                                  setCategorySearchTerm("");
                                }}
                              >
                                {category.label}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </FormControl>
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
                        <SelectItem value="MEAT">
                          {t("classification.options.meat")}
                        </SelectItem>
                        <SelectItem value="FISH">
                          {t("classification.options.fish")}
                        </SelectItem>
                        <SelectItem value="VEGETARIAN">
                          {t("classification.options.vegetarian")}
                        </SelectItem>
                        <SelectItem value="VEGAN">
                          {t("classification.options.vegan")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>{t("ingredients.label")}</FormLabel>
                <FormControl>
                  <div className="space-y-3">
                    {/* Paste ingredients section */}
                    <div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="rice:10g,polao:20g,chicken:200g"
                          value={ingredientPasteText}
                          onChange={(e) =>
                            setIngredientPasteText(e.target.value)
                          }
                          className="flex-1"
                        />
                        <Button type="button" onClick={handlePasteIngredients}>
                          <ClipboardPaste className="mr-1 h-4 w-4" />
                          {t("ingredients.addButton")} <Plus />
                        </Button>
                      </div>
                    </div>

                    {/* Display ingredients */}
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
                                placeholder={t(
                                  "upselling.priority.placeholder",
                                )}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                            <SelectItem value="5">5</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="recommended_combinations"
                render={() => (
                  <FormItem>
                    <FormLabel>
                      {t("combinations.maxLabel", { max: MAX_COMBINATIONS })}
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <div className="relative">
                          <Button
                            type="button"
                            variant="outline"
                            className={`h-10 w-full justify-between text-left ${
                              selectedCombinations.length >= MAX_COMBINATIONS
                                ? "cursor-not-allowed opacity-50"
                                : ""
                            } bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            onClick={() =>
                              setIsDropdownOpen(
                                selectedCombinations.length <
                                  MAX_COMBINATIONS && !isDropdownOpen,
                              )
                            }
                            disabled={
                              selectedCombinations.length >= MAX_COMBINATIONS
                            }
                          >
                            <span className="truncate">
                              {selectedCombinations.length >= MAX_COMBINATIONS
                                ? t("combinations.maxSelected", {
                                    max: MAX_COMBINATIONS,
                                  })
                                : t("combinations.placeholder")}
                            </span>
                            <svg
                              className="ml-2 h-4 w-4 shrink-0 opacity-50"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </Button>
                          {isDropdownOpen && (
                            <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
                              <div className="p-2">
                                <Input
                                  placeholder={t("combinations.search")}
                                  value={searchTerm}
                                  onChange={(e) =>
                                    setSearchTerm(e.target.value)
                                  }
                                  className="w-full"
                                />
                              </div>
                              {Object.keys(groupedItems).length === 0 && (
                                <div className="p-2 text-sm text-gray-500">
                                  {t("combinations.noResults")}
                                </div>
                              )}
                              {Object.entries(groupedItems).map(
                                ([category, items]) => (
                                  <div key={category} className="mb-2">
                                    <div className="px-4 py-2 text-sm font-bold text-black">
                                      {t("combinations.category.prefix")}{" "}
                                      {getCategoryLabel(category)}
                                    </div>
                                    {(items as MenuItemData[]).map((item) => (
                                      <div
                                        key={item.uid}
                                        className="cursor-pointer px-4 py-2 text-sm hover:bg-gray-100"
                                        onClick={() => handleSelect(item)}
                                      >
                                        {item.name}
                                      </div>
                                    ))}
                                  </div>
                                ),
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedCombinations.map((item) => (
                            <Badge key={item.uid} variant="secondary">
                              {`${item.name}`}
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
                )}
              />

              <div className="flex items-center justify-end">
                <Button type="submit" disabled={isSubmitDisabled || addLoading}>
                  {addLoading ? t("submit.loading") : t("submit.label")}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </CardContent>
    </div>
  );
};
