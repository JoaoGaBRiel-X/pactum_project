'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { IMaskInput } from 'react-imask';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2 } from 'lucide-react';

const convertSchema = z.object({
  proposalId: z.string().min(1, 'Selecione uma proposta aprovada'),
  document: z.string().min(14, 'CNPJ é obrigatório'),
  contactName: z.string().min(2, 'Nome do contato é obrigatório'),
  contactEmail: z.string().email('E-mail inválido'),
  contactPhone: z.string().optional(),
  zipCode: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

type ConvertFormValues = z.infer<typeof convertSchema>;

interface ConvertOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: any | null;
}

export function ConvertOpportunityModal({ isOpen, onClose, opportunity }: ConvertOpportunityModalProps) {
  const queryClient = useQueryClient();
  const [successData, setSuccessData] = useState<any>(null);

  // Fetch proposals for this opportunity
  const { data: proposals, isLoading: isLoadingProposals } = useQuery({
    queryKey: ['proposals', opportunity?.id],
    queryFn: () => apiFetch(`/crm/proposals?opportunityId=${opportunity?.id}`),
    enabled: !!opportunity?.id && isOpen,
  });

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<ConvertFormValues>({
    resolver: zodResolver(convertSchema),
    defaultValues: {
      proposalId: '',
      document: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      zipCode: '',
      street: '',
      number: '',
      city: '',
      state: '',
    }
  });

  useEffect(() => {
    if (opportunity && isOpen) {
      reset({
        proposalId: '',
        document: opportunity.lead?.document || '',
        contactName: opportunity.lead?.contactName || '',
        contactEmail: opportunity.lead?.email || '',
        contactPhone: opportunity.lead?.whatsapp || '',
      });
      setSuccessData(null);
    }
  }, [opportunity, isOpen, reset]);

  const mutation = useMutation({
    mutationFn: (data: ConvertFormValues) => 
      apiFetch(`/crm/opportunities/${opportunity.id}/convert`, {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: (data) => {
      setSuccessData(data);
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
    }
  });

  const onSubmit = (data: ConvertFormValues) => {
    mutation.mutate(data);
  };

  if (!opportunity) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        setTimeout(() => setSuccessData(null), 300);
      }
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <CheckCircle2 className="text-emerald-500" /> 
            Ganhar Oportunidade
          </DialogTitle>
          <DialogDescription>
            Converta esta oportunidade em um Cliente e gere o Contrato automaticamente. Preencha os dados obrigatórios que podem estar faltando no Lead.
          </DialogDescription>
        </DialogHeader>

        {successData ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Conversão Realizada com Sucesso!</h3>
            <p className="text-slate-500 max-w-sm">
              O cliente foi cadastrado e o contrato foi gerado e encontra-se em status DRAFT.
            </p>
            <div className="flex gap-4 pt-4">
              <Button onClick={() => window.open(`/customers/${successData.customerId}`, '_blank')} variant="outline">
                Ver Cliente
              </Button>
              <Button onClick={() => window.open(`/contracts/${successData.contractId}`, '_blank')}>
                Ver Contrato
              </Button>
              <Button onClick={onClose} variant="ghost">Fechar</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
            
            <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="font-semibold text-slate-800">1. Proposta Aprovada</h3>
              <div className="space-y-2">
                <Label htmlFor="proposalId" className={errors.proposalId ? 'text-destructive' : ''}>Selecione a Proposta base para o Contrato *</Label>
                <select 
                  id="proposalId"
                  {...register("proposalId")}
                  className={`flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 ${errors.proposalId ? 'border-destructive ring-1 ring-destructive focus-visible:ring-destructive' : 'border-slate-300 focus-visible:ring-primary'}`}
                >
                  <option value="">-- Selecione uma proposta --</option>
                  {proposals?.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      Proposta #{p.id.substring(0,8)} - {parseFloat(p.totalValue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </option>
                  ))}
                </select>
                {isLoadingProposals && <p className="text-xs text-slate-500">Carregando propostas...</p>}
                {errors.proposalId && <p className="text-destructive text-xs">{errors.proposalId.message}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800 border-b pb-2">2. Dados do Cliente (Faturamento)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Razão Social / Nome da Empresa</Label>
                  <Input value={opportunity.lead?.companyName || ''} disabled className="bg-slate-50" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="document" className={errors.document ? 'text-destructive' : ''}>CNPJ *</Label>
                  <Controller
                    control={control}
                    name="document"
                    render={({ field: { onChange, onBlur, value, ref } }) => (
                      <IMaskInput
                        id="document"
                        mask={[
                          { mask: '000.000.000-00' },
                          { mask: '00.000.000/0000-00' }
                        ]}
                        unmask={true}
                        onAccept={(val) => onChange(val)}
                        onBlur={onBlur}
                        value={value || ''}
                        inputRef={ref}
                        placeholder="00.000.000/0001-00"
                        className={`flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 ${errors.document ? 'border-destructive ring-1 ring-destructive focus-visible:ring-destructive' : 'border-slate-300 focus-visible:ring-primary'}`}
                      />
                    )}
                  />
                  {errors.document && <p className="text-destructive text-xs">{errors.document.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">CEP</Label>
                  <Controller
                    control={control}
                    name="zipCode"
                    render={({ field: { onChange, onBlur, value, ref } }) => (
                      <IMaskInput
                        id="zipCode"
                        mask="00000-000"
                        unmask={true}
                        onAccept={(val) => onChange(val)}
                        onBlur={onBlur}
                        value={value || ''}
                        inputRef={ref}
                        placeholder="00000-000"
                        className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800 border-b pb-2">3. Dados do Contato Principal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="contactName" className={errors.contactName ? 'text-destructive' : ''}>Nome Completo *</Label>
                  <Input id="contactName" {...register("contactName")} className={errors.contactName ? 'border-destructive' : ''} />
                  {errors.contactName && <p className="text-destructive text-xs">{errors.contactName.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactEmail" className={errors.contactEmail ? 'text-destructive' : ''}>E-mail Principal *</Label>
                  <Input id="contactEmail" type="email" {...register("contactEmail")} className={errors.contactEmail ? 'border-destructive' : ''} />
                  {errors.contactEmail && <p className="text-destructive text-xs">{errors.contactEmail.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">WhatsApp / Telefone</Label>
                  <Controller
                    control={control}
                    name="contactPhone"
                    render={({ field: { onChange, onBlur, value, ref } }) => (
                      <IMaskInput
                        id="contactPhone"
                        mask={[
                          { mask: '(00) 0000-0000' },
                          { mask: '(00) 00000-0000' }
                        ]}
                        unmask={true}
                        onAccept={(val) => onChange(val)}
                        onBlur={onBlur}
                        value={value || ''}
                        inputRef={ref}
                        placeholder="(00) 00000-0000"
                        className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {mutation.isError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">
                Erro ao converter: {mutation.error.message}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={mutation.isPending} className="bg-emerald-600 hover:bg-emerald-700">
                {mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Convertendo...</> : 'Confirmar Conversão'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
