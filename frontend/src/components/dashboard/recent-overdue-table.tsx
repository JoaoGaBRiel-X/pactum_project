import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface OverdueReceivable {
  id: string;
  customer: { corporateName: string };
  amount: number;
  dueDate: string;
  description: string;
}

export function RecentOverdueTable({ receivables }: { receivables: OverdueReceivable[] }) {
  if (!receivables || receivables.length === 0) {
    return <div className="p-4 text-center text-sm text-muted-foreground">Nenhuma fatura em atraso. Parabéns!</div>
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cliente</TableHead>
          <TableHead>Vencimento</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead className="text-right">Valor</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {receivables.map((rec) => (
          <TableRow key={rec.id}>
            <TableCell className="font-medium">{rec.customer.corporateName}</TableCell>
            <TableCell className="text-red-600">
              {format(new Date(rec.dueDate), "dd/MM/yyyy", { locale: ptBR })}
            </TableCell>
            <TableCell>{rec.description}</TableCell>
            <TableCell className="text-right font-semibold">
              {formatCurrency(rec.amount)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
