import { AdminLayoutWrapper } from "@/components/admin/AdminLayoutWrapper";
import { Metadata } from "next";
import { SITE_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Admin CMS | ${SITE_NAME}`,
  description: "Dynamic Content Management System",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}
