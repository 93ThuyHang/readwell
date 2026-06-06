import { ReactNode } from 'react'
import AdminSidebar from './components/AdminSidebar'

export const metadata = { title: 'Readwell Admin' }

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  )
}
