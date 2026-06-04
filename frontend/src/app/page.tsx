"use client"

import { useEffect, useState } from "react"
import { dashboardApi } from "@/services/dashboard-api"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { UpcomingRenewalsTable } from "@/components/dashboard/upcoming-renewals-table"
import { RecentOverdueTable } from "@/components/dashboard/recent-overdue-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RequirePermissions } from "@/components/auth/RequirePermissions"

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({
    activeContracts: 0,
    mrr: 0,
    overdueAmount: 0,
    churnRate: 0,
  })
  const [upcomingRenewals, setUpcomingRenewals] = useState([])
  const [recentOverdue, setRecentOverdue] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [metricsData, renewalsData, overdueData] = await Promise.all([
          dashboardApi.getMetrics(),
          dashboardApi.getUpcomingRenewals(),
          dashboardApi.getRecentOverdue()
        ])
        setMetrics(metricsData)
        setUpcomingRenewals(renewalsData)
        setRecentOverdue(overdueData)
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return <div className="p-8 flex items-center justify-center">Carregando métricas...</div>
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Executivo</h2>
      </div>

      <KpiCards metrics={metrics} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        <RequirePermissions permissions={['contracts:read', 'contracts:read_own']}>
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Renovações Próximas</CardTitle>
            </CardHeader>
            <CardContent>
              <UpcomingRenewalsTable contracts={upcomingRenewals} />
            </CardContent>
          </Card>
        </RequirePermissions>
        
        <RequirePermissions permissions="financial:read">
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Inadimplência Recente</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentOverdueTable receivables={recentOverdue} />
            </CardContent>
          </Card>
        </RequirePermissions>
      </div>
    </div>
  )
}

