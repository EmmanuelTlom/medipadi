export const metadata = {
  title: 'My Appointments',
  robots: { index: false, follow: false },
};

export default function AppointmentsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
