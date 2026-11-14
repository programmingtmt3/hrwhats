import { RestaurantsPage, restaurantsMetadata } from "@/components/sectors/restaurants/RestaurantsPage";

export const metadata = restaurantsMetadata("en");

export default function Page() {
  return <RestaurantsPage locale="en" />;
}
