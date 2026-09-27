import { ProfileView } from "@/components/profile/ProfileView";

export const metadata = { title: "Profil" };

/** Maps to `Profile`. Account settings (e-mail, notifications) open from here. */
export default function ProfilePage() {
  return <ProfileView />;
}
