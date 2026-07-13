import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import DashboardContainer from "@/components/layout/DashboardContainer";

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
    <DashboardContainer userEmail={session.user.email} onLogout={handleLogout}>
      {children}
    </DashboardContainer>
  );
}
