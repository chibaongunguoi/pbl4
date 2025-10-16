export const metadata = {
  title: "Admin Panel - Job Management System",
  description: "Admin dashboard for managing users and jobs",
};

export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      {children}
    </div>
  );
}