import { redirect } from "next/navigation";
import { requireAuthorizedAdmin } from "../../admin-auth";
import BugsClient from "./BugsClient";
import "./bugs.css";

export const dynamic = "force-dynamic";

export default async function BugsPage() {
  const admin = await requireAuthorizedAdmin("/admin/bugs");
  if (admin.role !== "owner" && !admin.canReportBugs) redirect("/access-denied");

  return (
    <BugsClient
      isOwner={admin.role === "owner"}
      sheetUrl="https://docs.google.com/spreadsheets/d/1T1QdjANrGtNj6UVszpIpQiVaidH6AHBlm349vUU4AKI/edit"
    />
  );
}
