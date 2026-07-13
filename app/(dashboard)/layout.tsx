import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import MobileNav from "@/components/layout/MobileNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const handleLogout = async () => {
    "use server";
    await signOut({ redirectTo: "/login" });
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#e5e2e2] font-sans">
      <Sidebar userEmail={session.user.email} onLogout={handleLogout} />
      <Header userEmail={session.user.email} />
      
      <div className="min-h-screen flex flex-col">
        {children}
      </div>

      <MobileNav />
    </div>
  );
}
