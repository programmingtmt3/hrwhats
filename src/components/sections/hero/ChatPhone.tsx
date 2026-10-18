import { BrandLogo } from "@/components/layout/BrandLogo";
import type { Dictionary } from "@/lib/i18n";

import styles from "./ChatPhone.module.css";
import { ChatScreen, type ChatMessage } from "./ChatScreen";

export function ChatPhone({ chat }: { chat: Dictionary["home"]["chat"] }) {
  const { messages, ...labels } = chat;

  return (
    <div className={styles.phone}>
      <ChatScreen
        avatar={<BrandLogo sizes="30px" decorative square />}
        messages={messages as ChatMessage[]}
        labels={labels}
      />
    </div>
  );
}
