import { CreateEditor } from "@/components/create/CreateEditor";

export const metadata = { title: "Plan oluştur" };

/** Maps to `Create` / `CreateMobile`. Pickers and settings modals open from the editor. */
export default function CreatePage() {
  return <CreateEditor />;
}
