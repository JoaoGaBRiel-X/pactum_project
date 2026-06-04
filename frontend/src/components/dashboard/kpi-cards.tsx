import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DollarSign, Users, AlertTriangle, FileText } from "lucide-react"
import { RequirePermissions } from "@/components/auth/RequirePermissions"

interface KpiCardsProps {
  metrics: {
    activeContracts: number;
    mrr: number;
    overdueAmount: number;
    churnRate: number;
  }
}

export function KpiCards({ metrics }: KpiCardsProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <RequirePermissions permissions="financial:read">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR (Receita Recorrente)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.mrr)}</div>
            <p className="text-xs text-muted-foreground">
              Soma dos contratos ativos
            </p>
          </CardContent>
        </Card>
      </RequirePermissions>
      
      <RequirePermissions permissions={['contracts:read', 'contracts:read_own']}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratos Ativos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeContracts}</div>
            <p className="text-xs text-muted-foreground">
              Base atual de contratos
            </p>
          </CardContent>
        </Card>
      </RequirePermissions>
      
      <RequirePermissions permissions="financial:read">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Inadimplência</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(metrics.overdueAmount)}</div>
            <p className="text-xs text-red-600/80">
              Faturas em atraso
            </p>
          </CardContent>
        </Card>
      </RequirePermissions>
      
      <RequirePermissions permissions={['contracts:read', 'contracts:read_own']}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Churn</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.churnRate}%</div>
            <p className="text-xs text-muted-foreground">
              Cancelamentos no mês
            </p>
          </CardContent>
        </Card>
      </RequirePermissions>
    </div>
  )
}
