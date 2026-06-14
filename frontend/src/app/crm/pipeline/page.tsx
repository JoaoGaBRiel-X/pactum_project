'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Target, User, DollarSign, GripVertical, CheckCircle2 } from 'lucide-react';
import { RequirePermissions } from '@/components/auth/RequirePermissions';
import { ConvertOpportunityModal } from '@/components/crm/ConvertOpportunityModal';

export default function PipelinePage() {
  const queryClient = useQueryClient();
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [opportunityToConvert, setOpportunityToConvert] = useState<any>(null);

  const { data: pipeline, isLoading, error } = useQuery({
    queryKey: ['pipeline'],
    queryFn: () => apiFetch('/crm/pipeline'),
  });

  const moveMutation = useMutation({
    mutationFn: ({ id, stageId }: { id: string, stageId: string }) => 
      apiFetch(`/crm/opportunities/${id}/move`, {
        method: 'PATCH',
        body: JSON.stringify({ stageId })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
    },
    onError: (err: any) => {
      alert(`Erro ao mover oportunidade: ${err.message}`);
    }
  });

  const handleDragStart = (e: React.DragEvent, opportunity: any) => {
    setDraggedItem(opportunity);
    e.dataTransfer.effectAllowed = 'move';
    // Para Firefox requer um setData
    e.dataTransfer.setData('text/plain', opportunity.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (!draggedItem) return;

    if (draggedItem.pipelineStageId !== stageId) {
      // Otimização Otimista: Mover no UI imediatamente
      queryClient.setQueryData(['pipeline'], (old: any) => {
        if (!old) return old;
        const newStages = old.stages.map((stage: any) => {
          if (stage.id === draggedItem.pipelineStageId) {
            return { ...stage, opportunities: stage.opportunities.filter((o: any) => o.id !== draggedItem.id) };
          }
          if (stage.id === stageId) {
            return { ...stage, opportunities: [{ ...draggedItem, pipelineStageId: stageId }, ...stage.opportunities] };
          }
          return stage;
        });
        return { ...old, stages: newStages };
      });

      moveMutation.mutate({ id: draggedItem.id, stageId });
    }
    setDraggedItem(null);
  };

  if (isLoading) {
    return <div className="p-12 text-center text-slate-500 animate-pulse">Carregando pipeline...</div>;
  }

  if (error) {
    return (
      <div className="p-12 text-center text-red-500 flex flex-col items-center gap-2">
        <AlertCircle size={24} />
        Erro ao carregar o funil de vendas.
      </div>
    );
  }

  return (
    <RequirePermissions permissions="crm:read">
      <div className="flex flex-col h-screen overflow-hidden text-slate-800 bg-slate-50/50">
        <div className="px-6 py-6 border-b border-slate-200 bg-white">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Target className="text-indigo-600" /> Pipeline de Vendas: {pipeline?.name}
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Arraste os cards para avançar as oportunidades no funil.</p>
        </div>

        <div className="flex-1 overflow-x-auto p-6">
          <div className="flex gap-6 h-full items-start min-w-max pb-8">
            {pipeline?.stages?.map((stage: any) => (
              <div 
                key={stage.id} 
                className="w-80 flex flex-col h-full max-h-[calc(100vh-160px)] bg-slate-100/80 rounded-xl border border-slate-200 shadow-sm"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                <div className="p-4 border-b border-slate-200 bg-slate-100/50 rounded-t-xl flex justify-between items-center">
                  <h3 className="font-semibold text-slate-700 uppercase tracking-wide text-sm">{stage.name}</h3>
                  <Badge variant="secondary" className="bg-slate-200 text-slate-600">{stage.opportunities?.length || 0}</Badge>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-slate-300">
                  {stage.opportunities?.map((opp: any) => (
                    <Card 
                      key={opp.id} 
                      draggable 
                      onDragStart={(e) => handleDragStart(e, opp)}
                      className="p-3 cursor-grab active:cursor-grabbing border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group bg-white"
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold text-sm text-indigo-900 leading-tight pr-4">{opp.name}</h4>
                        <GripVertical size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </div>
                      
                      <div className="mt-3 space-y-2">
                        {opp.lead?.companyName && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <User size={12} className="text-slate-400" />
                            <span className="truncate">{opp.lead.companyName}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                            <DollarSign size={12} />
                            {parseFloat(opp.expectedRevenue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </div>
                          
                          <div className="text-[10px] text-slate-400 font-medium">
                            {opp.probability}% chance
                          </div>
                        </div>

                        {/* Convert Button (Visible on hover or last stages, but let's make it always accessible) */}
                        <div className="pt-2">
                          <button 
                            type="button"
                            onClick={() => setOpportunityToConvert(opp)}
                            className="w-full flex items-center justify-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 py-1.5 rounded-md transition-colors"
                          >
                            <CheckCircle2 size={14} /> Ganhar & Converter
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {stage.opportunities?.length === 0 && (
                    <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg p-6 opacity-50 text-sm text-slate-400">
                      Solte o card aqui
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <ConvertOpportunityModal 
          isOpen={!!opportunityToConvert} 
          onClose={() => setOpportunityToConvert(null)} 
          opportunity={opportunityToConvert} 
        />
      </div>
    </RequirePermissions>
  );
}
