import { HomeView } from "@/components/home/HomeView";
import { NotificationsPanel } from "@/components/notifications/NotificationsPanel";

export const metadata = { title: "Bildirimler" };

/** `Notifications` artboard: the panel slides over a dimmed home. */
export default function NotificationsPage() {
  return (
    <>
      <div className="pointer-events-none hidden opacity-35 md:block" aria-hidden>
        <HomeView />
      </div>
      <NotificationsPanel />
    </>
  );
}
