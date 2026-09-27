import { getConversation, listConversations, markConversationRead } from "@partile/db";
import { MessagesView } from "@/components/messages/MessagesView";
import { requireViewer } from "@/lib/auth";
import { routes } from "@/lib/routes";

export const metadata = { title: "Mesajlar" };
export const dynamic = "force-dynamic";

/** `Messages` artboard: plan-scoped host ↔ guest threads. `?s=` selects a thread. */
export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ s?: string }> }) {
  const viewer = await requireViewer(routes.messages);
  const { s } = await searchParams;
  const list = await listConversations(viewer.id);
  const selectedId = s && list.some((c) => c.id === s) ? s : undefined;
  if (selectedId) await markConversationRead(selectedId, viewer.id);
  const thread = selectedId ? await getConversation(selectedId, viewer.id) : null;
  return <MessagesView viewer={viewer} conversations={selectedId ? await listConversations(viewer.id) : list} thread={thread} />;
}
