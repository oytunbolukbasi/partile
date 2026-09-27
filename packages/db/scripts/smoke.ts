// End-to-end smoke test of the data layer. It WRITES (RSVP, poll vote, new plan, picks a poll day), so it only runs
// against local PGlite: refuse when DATABASE_URL points at a real database.
if (process.env.DATABASE_URL) {
  console.error("smoke: DATABASE_URL is set — this test writes data. Unset it to run against local PGlite.");
  process.exit(1);
}
import { getPlanByCode, listPlansForUser, listNotifications, getUserByEmail, createVerificationCode, consumeVerificationCode, upsertRsvp, votePoll, pickPollDay, createPlan, DEMO_EMAIL } from "../src/index.ts";
const t0 = Date.now();
const u = await getUserByEmail(DEMO_EMAIL);
console.log("user", u?.id, u?.name, `${Date.now() - t0}ms`);
const p = await getPlanByCode("ece30");
console.log("ece30", p?.title, "hosts", p?.hosts.map(h=>h.name), "guests", p?.guests.length, "feed", p?.feed.length, "blasts", p?.blasts.length);
const m = await getPlanByCode("mangal");
console.log("mangal poll", m?.poll?.length, m?.pollVotes);
const mine = await listPlansForUser(u!.id);
console.log("my plans", mine.map(x=>`${x.plan.code}:${x.role}`));
console.log("notifications", (await listNotifications(u!.id)).length);
const code = await createVerificationCode("guest@example.com","rsvp");
const g = await consumeVerificationCode("guest@example.com", code);
console.log("verified user", g?.id, "reuse", (await consumeVerificationCode("guest@example.com", code)) === null);
const r = await upsertRsvp(p!.id, g!.id, g!.email, { status:"going", name:"Test Misafir", email:g!.email, plusOnes:1, plusOneNames:["Ayşe"], answers:{q2:"Evet"}, followHost:true });
console.log("rsvp", r);
await votePoll(m!.id, g!.id, g!.email, "Test Misafir", { o1:"yes", o2:"no", o3:"maybe" });
console.log("after vote", (await getPlanByCode("mangal"))?.pollVotes);
const created = await createPlan(u!.id, { ...p!, title:"Deneme Planı", poll: undefined }, true);
console.log("created", created);
await pickPollDay(m!.id, "o1");
const m2 = await getPlanByCode("mangal");
console.log("picked", m2?.startsAt, "poll", m2?.poll, "going", m2?.guests.filter(g=>g.status==="going").length);
console.log("total", `${Date.now() - t0}ms`);
process.exit(0);
