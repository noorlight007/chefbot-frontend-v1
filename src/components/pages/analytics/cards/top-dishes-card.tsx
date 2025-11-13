import React, { useState } from "react";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { useGetTopDishesAnalyticsQuery } from "@/redux/reducers/restaurants-reducer";
import { useTranslations } from "next-intl";

// Filter component
const Filters = ({
  timeRange,
  startDate,
  endDate,
  category,
  onTimeRangeChange,
  onStartDateChange,
  onEndDateChange,
  onCategoryChange,
  onReset,
}: {
  timeRange: string;
  startDate: string;
  endDate: string;
  category: string;
  onTimeRangeChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onReset: () => void;
}) => {
  const t = useTranslations("analytics.topDishes.filters");

  const timeRangeOptions = [
    { value: "", label: t("allTime") },
    { value: "today", label: t("today") },
    { value: "yesterday", label: t("yesterday") },
    { value: "last_7_days", label: t("last7Days") },
    { value: "last_30_days", label: t("last30Days") },
    { value: "this_week", label: t("thisWeek") },
    { value: "last_week", label: t("lastWeek") },
    { value: "this_month", label: t("thisMonth") },
    { value: "last_month", label: t("lastMonth") },
  ];

  const categoryOptions = [
    { value: "", label: t("allCategories") },
    { value: "STARTERS", label: t("starters") },
    { value: "MAIN_COURSES", label: t("mainCourses") },
    { value: "DESSERTS", label: t("desserts") },
    { value: "DRINKS_ALCOHOLIC", label: t("drinksAlcoholic") },
    { value: "DRINKS_NON_ALCOHOLIC", label: t("drinksNonAlcoholic") },
    { value: "SPECIALS", label: t("specials") },
  ];

  const isDateDisabled = !!timeRange;
  const isTimeRangeDisabled = !!startDate || !!endDate;
  const showResetButton = !!timeRange || !!startDate || !!endDate || !!category;

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              {t("timeRange")}
            </label>
            <select
              value={timeRange}
              onChange={(e) => onTimeRangeChange(e.target.value)}
              disabled={isTimeRangeDisabled}
              className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                isTimeRangeDisabled ? "cursor-not-allowed opacity-50" : ""
              }`}
            >
              {timeRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              {t("startDate")}
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              disabled={isDateDisabled}
              className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                isDateDisabled ? "cursor-not-allowed opacity-50" : ""
              }`}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              {t("endDate")}
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              disabled={isDateDisabled}
              className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                isDateDisabled ? "cursor-not-allowed opacity-50" : ""
              }`}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              {t("category")}
            </label>
            <select
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {showResetButton && (
            <div className="mt-4 flex items-end md:mt-0">
              <button
                onClick={onReset}
                className="inline-flex h-10 w-full items-center justify-center whitespace-nowrap rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground ring-offset-background transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              >
                {t("resetFilters")}
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function TopDishesCard({
  organization,
}: {
  organization?: string;
}) {
  const t = useTranslations("analytics.topDishes");
  const [timeRange, setTimeRange] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [category, setCategory] = useState("");

  const handleReset = () => {
    setTimeRange("");
    setStartDate("");
    setEndDate("");
    setCategory("");
  };

  // API QUERY PARAMETERS - builds the parameters object for the API call
  const queryParams: {
    restaurant_id: string;
    category?: string;
    time_range?: string;
    start_date?: string;
    end_date?: string;
  } = {
    restaurant_id: organization as string,
    category: category || undefined,
    time_range: timeRange || undefined,
    start_date: startDate || undefined,
    end_date: endDate || undefined,
  };

  // API CALL - this is the actual API hook that fetches data
  const { data, isLoading } = useGetTopDishesAnalyticsQuery(queryParams, {
    skip: !organization,
  });

  const chartConfig: ChartConfig = {
    orders: {
      label: t("chart.orders"),
      color: "hsl(var(--chart-1))",
    },
    share_of_total_sales: {
      label: t("chart.salesShare"),
      color: "hsl(var(--chart-2))",
    },
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-muted-foreground">
          {t("noData")}
        </p>
      </div>

      <Filters
        timeRange={timeRange}
        startDate={startDate}
        endDate={endDate}
        category={category}
        onTimeRangeChange={setTimeRange}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onCategoryChange={setCategory}
        onReset={handleReset}
      />

      {isLoading && (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              <p className="text-muted-foreground">{t("chart.loading")}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && data && data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("chart.title")}</CardTitle>
            <CardDescription>
              {t("chart.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="orders"
                  fill="var(--color-orders)"
                  radius={[4, 4, 0, 0]}
                  name={t("chart.orders")}
                />
                <Bar
                  dataKey="share_of_total_sales"
                  fill="var(--color-share_of_total_sales)"
                  radius={[4, 4, 0, 0]}
                  name={t("chart.salesShare")}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {!isLoading && (!data || data.length === 0) && (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <svg
                  className="h-8 w-8 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                {t("chart.noData.title")}
              </h3>
              <p className="text-muted-foreground">
                {t("chart.noData.description")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
