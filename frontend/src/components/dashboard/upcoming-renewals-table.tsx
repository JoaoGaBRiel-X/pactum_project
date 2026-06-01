import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format, differenceInDays } from "date-fns"
import { ptBR } from "date-fns/locale"

interface RenewalContract {
  id: string;
  customer: { corporateName: string };
  product: { name: string };
  endDate: string;
}

export function UpcomingRenewalsTable({ contracts }: { contracts: RenewalContract[] }) {
  if (!contracts || contracts.length === 0) {
    return <div className="p-4 text-center text-sm text-muted-foreground">Nenhum contrato vencendo em breve.</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cliente</TableHead>
          <TableHead>Produto</TableHead>
          <TableHead>Vencimento</TableHead>
          <TableHead className="text-right">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contracts.map((contract) => {
          const daysLeft = differenceInDays(new Date(contract.endDate), new Date())
          
          let badgeVariant: "destructive" | "default" | "secondary" = "default"
          if (daysLeft < 15) badgeVariant = "destructive"
          else if (daysLeft > 30) badgeVariant = "secondary"

          return (
            <TableRow key={contract.id}>
              <TableCell className="font-medium">{contract.customer.corporateName}</TableCell>
              <TableCell>{contract.product.name}</TableCell>
              <TableCell>{format(new Date(contract.endDate), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
              <TableCell className="text-right">
                <Badge variant={badgeVariant}>
                  {daysLeft < 0 ? "Vencido" : `${daysLeft} dias`}
                </Badge>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
