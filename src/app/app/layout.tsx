import { AppNav } from "@/components/app-nav";
import { NameChatAssistant } from "@/components/name-chat-assistant";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <AppNav />
      {children}
      <NameChatAssistant />
    </div>
  );
}
