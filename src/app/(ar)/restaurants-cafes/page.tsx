import { RestaurantsPage, restaurantsMetadata } from "@/components/sectors/restaurants/RestaurantsPage";

export const metadata = restaurantsMetadata("ar");

export default function Page() {
  return <RestaurantsPage locale="ar" />;
}
