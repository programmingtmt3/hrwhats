import { WhatsappBanPage } from "@/components/pages/WhatsappBanPage";
import { getDictionary } from "@/lib/i18n";
import { getPageMetadata } from "@/lib/seo";

export const metadata = getPageMetadata("ar", "/whatsapp-ban/", getDictionary("ar").whatsappBan.meta);

export default function Page() {
  return <WhatsappBanPage locale="ar" />;
}
