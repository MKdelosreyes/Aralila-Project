
import Sidebar from '@/components/ui/student/sidebar';
import SidebarMobile from '@/components/ui/student/sidebar-mobile';
import { ReactNode } from 'react';

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 p-8 overflow-auto pb-16 md:pb-0">{children}</main>
      </div>
      <SidebarMobile />
    </>
  );
}
