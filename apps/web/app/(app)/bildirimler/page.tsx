import { listNotifications, listPlansForUser } from "@partile/db";
import { HomeView } from "@/components/home/HomeView";
import { NotificationsPanel } from "@/components/notifications/NotificationsPanel";
import { requireViewer } from "@/lib/auth";
import { routes } from "@/lib/routes";

export const metadata = { title: "Bildirimler" };
export const dynamic = "force-dynamic";

/** `Notifications` artboard: the panel slides over a dimmed home. */
export default async function NotificationsPage() {
  const viewer = await requireViewer(routes.notifications);
  const [items, plans] = await Promise.all([listNotifications(viewer.id), listPlansForUser(viewer.id)]);
  return (
    <>
      <div className="pointer-events-none hidden opacity-35 md:block" aria-hidden>
        <HomeView viewer={viewer} plans={plans} />
      </div>
      <NotificationsPanel viewer={viewer} items={items} />
    </>
  );
}
