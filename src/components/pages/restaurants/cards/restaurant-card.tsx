import { FC } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

const RestaurantCard: FC<{ restaurant: RestaurantData }> = ({ restaurant }) => {
  const t = useTranslations("restaurants.card");

  return (
    <Card className="transition-shadow duration-200 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 overflow-hidden rounded-lg shadow-sm">
            <Image
              src={restaurant?.logo || "/restaurant-demo.jpg"}
              alt={restaurant?.name || "Restaurant Logo"}
              width={80}
              height={80}
              className="h-full w-full transform object-cover transition-transform duration-200 hover:scale-105"
              priority={true}
              loading="eager"
            />
          </div>
          <div className="flex-1">
            <h3 className="mb-1 text-lg font-semibold">{restaurant?.name}</h3>
            <div className="mb-2 flex items-center text-muted-foreground">
              <MapPin className="mr-1 h-4 w-4" />
              <p className="text-sm">
                {restaurant?.street +
                  ", " +
                  restaurant?.city +
                  "," +
                  restaurant?.country}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center gap-3 border-t bg-gradient-to-r from-gray-50 to-gray-100 p-4">
        <Link href={`/restaurants/${restaurant.uid}/tables`} className="flex-1">
          <Button
            variant="outline"
            size="sm"
            className="w-full rounded-md border-gray-200 font-medium shadow-sm transition-all duration-200 hover:bg-primary hover:text-white hover:shadow-md"
          >
            {t("tables")}
          </Button>
        </Link>
        <Link href={`/restaurants/${restaurant.uid}/menu`} className="flex-1">
          <Button
            variant="outline"
            size="sm"
            className="w-full rounded-md border-gray-200 font-medium shadow-sm transition-all duration-200 hover:bg-primary hover:text-white hover:shadow-md"
          >
            {t("viewMenu")}
          </Button>
        </Link>
        <Link href={`/restaurants/${restaurant.uid}`} className="flex-1">
          <Button
            size="sm"
            className="w-full rounded-md border-gray-200 bg-primary font-medium text-white shadow-sm transition-all duration-200 hover:shadow-md"
          >
            {t("details")}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

interface OpeningHour {
  id: number;
  uid: string;
  day: string;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

export interface RestaurantData {
  uid: string;
  logo: string | null;
  name: string;
  whatsapp_number: string;
  email: string;
  description: string;
  website: string;
  country: string;
  city: string;
  street: string;
  zip_code: string;
  services: string;
  opening_hours: OpeningHour[];
}

export default RestaurantCard;
