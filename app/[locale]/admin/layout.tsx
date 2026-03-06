import { cookies } from "next/headers";
import { setRequestLocale } from "next-intl/server";
import AdminGate from "./AdminGate";
import AdminNav from "@/components/admin/AdminNav";

const ADMIN_COOKIE = "admin_auth";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const cookieStore = await cookies();
  const auth = cookieStore.get(ADMIN_COOKIE)?.value;

  if (!auth) {
    return <AdminGate />;
  }

  return (
    <div className="px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <AdminNav />
        {children}
      </div>
    </div>
  );
}
