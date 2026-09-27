import { countFollowers, listCoAttendees, listFollowing, listPlansForUser } from "@partile/db";
import { ProfileView } from "@/components/profile/ProfileView";
import { requireViewer } from "@/lib/auth";
import { routes } from "@/lib/routes";

export const metadata = { title: "Profil" };
export const dynamic = "force-dynamic";

/** Maps to `Profile`. Account settings (e-mail, notifications) open from here. */
export default async function ProfilePage() {
  const viewer = await requireViewer(routes.profile);
  const [plans, people, following, followers] = await Promise.all([listPlansForUser(viewer.id), listCoAttendees(viewer.id), listFollowing(viewer.id), countFollowers(viewer.id)]);
  return <ProfileView viewer={viewer} plans={plans} people={people} following={following} followers={followers} />;
}
