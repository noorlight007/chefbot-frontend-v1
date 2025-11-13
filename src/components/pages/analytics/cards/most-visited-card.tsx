import { useGetMostVisitedAnalyticsQuery } from "@/redux/reducers/restaurants-reducer";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import LoadingHeatmap from "../skeletons/analytics-skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const BookingHeatmap = ({
  data,
}: {
  data: AnalyticsData;
}) => {
  const t = useTranslations("analytics.mostVisited.heatmap");
  const days = [
    "monday",
    "tuesday", 
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  const timeSlots = [
    "08:00-10:00",
    "10:00-12:00", 
    "12:00-14:00",
    "16:00-18:00",
    "18:00-20:00",
    "20:00-22:00",
  ];

  const heatmapMatrix = days.map((day) => {
    const dayData = data?.find((d) => d.day.toLowerCase() === day)?.visits || [];
    return timeSlots.map((slot) => {
      const visit = dayData.find((v) => v.slot === slot);
      return visit ? visit.count : 0;
    });
  });

  const maxValue = Math.max(...heatmapMatrix.flat());
  const minValue = Math.min(...heatmapMatrix.flat());

  const getColor = (value: number) => {
    if (value === 0) {
      return "rgb(248, 250, 252)";
    }

    const intensity = maxValue > minValue ? (value - minValue) / (maxValue - minValue) : 0;
    const colors = [
      { r: 219, g: 234, b: 254 },
      { r: 147, g: 197, b: 253 },
      { r: 59, g: 130, b: 246 },
      { r: 99, g: 102, b: 241 },
      { r: 135, g: 92, b: 246 },
      { r: 168, g: 85, b: 266 },
    ];

    const scaledIntensity = intensity * (colors.length - 1);
    const colorIndex = Math.floor(scaledIntensity);
    const remainder = scaledIntensity - colorIndex;

    const color1 = colors[Math.min(colorIndex, colors.length - 1)];
    const color2 = colors[Math.min(colorIndex + 1, colors.length - 1)];

    const r = Math.round(color1.r + (color2.r - color1.r) * remainder);
    const g = Math.round(color1.g + (color2.g - color1.g) * remainder);
    const b = Math.round(color1.b + (color2.b - color1.b) * remainder);

    return `rgb(${r}, ${g}, ${b})`;
  };

  const getTextColor = (value: number) => {
    if (value === 0) return "#9ca3af";
    const intensity = maxValue > minValue ? (value - minValue) / (maxValue - minValue) : 0;
    return intensity > 0.5 ? "#ffffff" : "#374151";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-full">
            <div className="mb-2 flex">
              <div className="w-24"></div>
              {timeSlots.map((slot, index) => (
                <div key={index} className="min-w-20 flex-1 text-center">
                  <div className="px-2 py-2 text-sm font-medium text-muted-foreground">
                    {slot}
                  </div>
                </div>
              ))}
            </div>

            {heatmapMatrix.map((dayData, dayIndex) => (
              <div key={dayIndex} className="mb-1 flex">
                <div className="flex w-24 items-center">
                  <div className="pr-3 text-right text-sm font-semibold text-muted-foreground">
                    {t(days[dayIndex])}
                  </div>
                </div>

                {dayData.map((value, timeIndex) => (
                  <div
                    key={timeIndex}
                    className="mx-0.5 min-w-14 flex-1 cursor-pointer rounded-lg transition-all duration-300 hover:shadow-md"
                    style={{
                      backgroundColor: getColor(value),
                      minHeight: "60px",
                    }}
                  >
                    <div
                      className="flex h-full w-full items-center justify-center rounded-lg text-sm font-semibold"
                      style={{ color: getTextColor(value) }}
                    >
                      {value > 0 ? value : ""}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">{t("bookingCount")}:</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">{t("low")}</span>
            <div className="flex space-x-1">
              {[0, 0.2, 0.4, 0.6, 0.8, 1].map((intensity, index) => (
                <div
                  key={index}
                  className="h-4 w-4 rounded"
                  style={{
                    backgroundColor:
                      intensity === 0
                        ? "rgb(248, 250, 252)"
                        : (() => {
                            const colors = [
                              { r: 219, g: 234, b: 254 },
                              { r: 147, g: 197, b: 253 },
                              { r: 59, g: 130, b: 246 },
                              { r: 99, g: 102, b: 241 },
                              { r: 139, g: 92, b: 246 },
                              { r: 168, g: 85, b: 247 },
                            ];
                            const scaledIntensity = intensity * (colors.length - 1);
                            const colorIndex = Math.floor(scaledIntensity);
                            const color = colors[Math.min(colorIndex, colors.length - 1)];
                            return `rgb(${color.r}, ${color.g}, ${color.b})`;
                          })(),
                  }}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">{t("high")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const FilterSection = ({
  timeRange,
  startDate,
  endDate,
  onTimeRangeChange,
  onStartDateChange,
  onEndDateChange,
  onReset,
}: {
  timeRange: string;
  startDate: string;
  endDate: string;
  onTimeRangeChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onReset: () => void;
}) => {
  const t = useTranslations("analytics.mostVisited.heatmap");
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

  const isDateDisabled = !!timeRange;
  const isTimeRangeDisabled = !!startDate || !!endDate;
  const showResetButton = !!timeRange || !!startDate || !!endDate;

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-muted-foreground">{t("timeRange")}</label>
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
            <label className="text-sm font-medium text-muted-foreground">{t("startDate")}</label>
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
            <label className="text-sm font-medium text-muted-foreground">{t("endDate")}</label>
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

          {showResetButton && (
            <div className="flex items-end">
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

export default function MostVisitedCard({
  organization,
}: {
  organization: string;
}) {
  const t = useTranslations("analytics.mostVisited");
  const [timeRange, setTimeRange] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleReset = () => {
    setTimeRange("");
    setStartDate("");
    setEndDate("");
  };

  const queryParams = {
    restaurant_id: organization,
    time_range: timeRange || undefined,
    start_date: startDate || undefined,
    end_date: endDate || undefined,
  };

  const { data, isLoading, error } = useGetMostVisitedAnalyticsQuery(queryParams, {
    skip: !organization,
  });

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("title")}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          {t("heatmap.description")}
        </p>
      </div>

      <FilterSection
        timeRange={timeRange}
        startDate={startDate}
        endDate={endDate}
        onTimeRangeChange={setTimeRange}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onReset={handleReset}
      />

      {isLoading && <LoadingHeatmap />}

      {!isLoading && data && <BookingHeatmap data={data} />}

      {!isLoading && !data && !error && (
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
              <h3 className="mb-2 text-lg font-semibold">{t("heatmap.noBookingData")}</h3>
              <p className="text-muted-foreground">
                {t("heatmap.tryDifferentRange")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

type Visit = {
  slot: string;
  count: number;
};

type DayData = {
  day: string;
  visits: Visit[];
};

type AnalyticsData = DayData[];
