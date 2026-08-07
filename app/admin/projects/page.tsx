import { redirect } from "next/navigation";
import { requireAuthorizedAdmin } from "../../admin-auth";
import ProjectsClient from "./ProjectsClient";
import "../admin.css";
import "./projects.css";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const admin = await requireAuthorizedAdmin("/admin/projects");
  if (admin.role !== "owner") redirect("/access-denied");
  return <ProjectsClient />;
}
