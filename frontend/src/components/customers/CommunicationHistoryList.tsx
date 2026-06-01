'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle2, Clock, XCircle, Mail } from 'lucide-react';

export function CommunicationHistoryList({ customerId }: { customerId: string }) {
  const { data: history, isLoading } = useQuery({
    queryKey: ['communications', customerId],
    queryFn: () => apiFetch(`/notification-templates/history/customer/${customerId}`),
  });

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Carregando histórico...</div>;
  }

  if (!history || history.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-slate-500 bg-slate-50 rounded-lg border border-dashed">
        <Mail className="w-12 h-12 text-slate-300 mb-3" />
        <p>Nenhuma comunicação registrada para este cliente.</p>
      </div>
    );
  }

  const renderStatus = (status: string) => {
    switch (status) {
      case 'SENT':
        return <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-medium"><CheckCircle2 size={12}/> Enviado</span>;
      case 'FAILED':
        return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-medium"><XCircle size={12}/> Falhou</span>;
      default:
        return <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-full text-xs font-medium"><Clock size={12}/> Pendente</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Destinatário</TableHead>
            <TableHead>Assunto</TableHead>
            <TableHead>Template</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((h: any) => (
            <TableRow key={h.id} className="hover:bg-slate-50">
              <TableCell className="text-slate-600">
                {format(new Date(h.sentAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
              </TableCell>
              <TableCell className="font-medium text-slate-700">{h.recipient}</TableCell>
              <TableCell className="text-slate-800">{h.subject}</TableCell>
              <TableCell>
                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-mono">
                  {h.templateName || 'MANUAL'}
                </span>
              </TableCell>
              <TableCell>
                {renderStatus(h.status)}
                {h.errorMessage && (
                  <p className="text-xs text-red-500 mt-1 max-w-[200px] truncate" title={h.errorMessage}>
                    {h.errorMessage}
                  </p>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
