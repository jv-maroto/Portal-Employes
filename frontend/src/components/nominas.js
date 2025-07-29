import PayrollList from './payroll-list'

export default function PayrollPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Nóminas</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
        <PayrollList />
      </div>
    </div>
  )
}

