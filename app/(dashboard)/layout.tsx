import DashboardContainer from "@/components/layout/DashboardContainer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const mockEmail = "kundu.aritra2007@gmail.com";

  const handleLogout = async () => {
    "use server";
    // Bypassed for database-free LocalStorage version
  };

  return (
    <DashboardContainer userEmail={mockEmail} onLogout={handleLogout}>
      {children}
    </DashboardContainer>
  );
}
