import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface HistoryEvent {
  id: string;
  status: string;
  reason?: string;
  changedAt: string;
  changedBy?: string;
  totalValue: number;
}

export function ContractHistoryTimeline({ events }: { events: HistoryEvent[] }) {
  if (!events || events.length === 0) {
    return <p className="text-muted-foreground text-sm">Nenhum histórico disponível.</p>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-slate-200';
      case 'PENDING_SIGNATURE': return 'bg-amber-400';
      case 'ACTIVE': return 'bg-green-500';
      case 'SUSPENDED': return 'bg-red-400';
      case 'CANCELLED': return 'bg-red-600';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div key={event.id} className="relative flex gap-4">
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(event.status)} mt-1.5`} />
            {index !== events.length - 1 && (
              <div className="w-px h-full bg-border my-1" />
            )}
          </div>
          <div className="pb-4">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-800">{event.status}</span>
              <span className="text-xs text-muted-foreground">
                {format(new Date(event.changedAt), "dd 'de' MMM, yyyy 'às' HH:mm", { locale: ptBR })}
              </span>
            </div>
            {event.reason && (
              <p className="text-sm text-slate-600 mt-1">{event.reason}</p>
            )}
            <div className="text-xs text-muted-foreground mt-1">
              Valor: R$ {Number(event.totalValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              {event.changedBy && ` • Modificado por: ${event.changedBy}`}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
