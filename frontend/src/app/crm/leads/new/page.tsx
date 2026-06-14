'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { tenantSettingsApi } from '@/services/tenant-settings-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ComboboxCreatable } from '@/components/ui/combobox-creatable';
import { Briefcase, Building, Loader2, Phone, Target } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { IMaskInput } from 'react-imask';
import { RequirePermissions } from '@/components/auth/RequirePermissions';
import { toast } from 'sonner';

const leadSchema = z.object({
  companyName: z.string().min(2, 'Razão Social é obrigatória'),
  tradeName: z.string().optional(),
  document: z.string().optional(),
  contactName: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  segment: z.string().optional(),
  needsMappingAnswers: z.record(z.string(), z.any()).optional(),
  sourceChannel: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadSchema>;

export default function NewLeadPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { register, control, handleSubmit, formState: { errors } } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    mode: 'onTouched',
    defaultValues: {
      companyName: '',
      tradeName: '',
      document: '',
      contactName: '',
      whatsapp: '',
      email: '',
      segment: '',
      sourceChannel: '',
    }
  });

  const { data: settings } = useQuery({
    queryKey: ['tenantSettings'],
    queryFn: () => tenantSettingsApi.getSettings(),
  });

  const handleCreateSegment = async (newSegment: string) => {
    if (!settings) return;
    const currentSegments = settings.preRegisteredSegments || [];
    if (!currentSegments.includes(newSegment)) {
      await tenantSettingsApi.updateSettings({
        ...settings,
        preRegisteredSegments: [...currentSegments, newSegment]
      });
      queryClient.invalidateQueries({ queryKey: ['tenantSettings'] });
    }
  };

  const mutation = useMutation({
    mutationFn: (data: LeadFormValues) => apiFetch('/crm/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      toast.success("Lead criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      router.push('/crm/leads');
    },
    onError: (err: any) => {
      toast.error(err.message || "Erro ao salvar lead.");
    }
  });

  const onSubmit = (data: LeadFormValues) => {
    // Clean up non-digits before sending to backend if necessary
    // Parse the answers back to numeric keys
    const parsedAnswers: Record<string, any> = {};
    if (data.needsMappingAnswers) {
      Object.keys(data.needsMappingAnswers).forEach(key => {
        if (key.startsWith('ans_')) {
          parsedAnswers[key.replace('ans_', '')] = data.needsMappingAnswers![key];
        }
      });
    }

    const payload = {
      ...data,
      document: data.document ? data.document.replace(/\D/g, '') : '',
      whatsapp: data.whatsapp ? data.whatsapp.replace(/\D/g, '') : '',
      needsMappingAnswers: Object.keys(parsedAnswers).length > 0 ? parsedAnswers : undefined,
    };
    mutation.mutate(payload);
  };

  return (
    <RequirePermissions permissions={['crm:manage']}>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        <div className="flex items-center gap-2">
          <Briefcase className="text-primary w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">Novo Lead</h1>
            <p className="text-muted-foreground">Preencha os dados do potencial cliente para o funil de vendas.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit, (errs) => {
          console.log("Form errors:", errs);
          const errorMessages = Object.values(errs).map((e: any) => e.message).filter(Boolean);
          if (errorMessages.length > 0) {
            toast.error(`Verifique os erros: ${errorMessages.join(', ')}`);
          } else {
            toast.error('Por favor, preencha corretamente os campos obrigatórios em vermelho.');
          }
        })} className="space-y-8">
          
          {/* Informações Básicas */}
          <div className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 border-b pb-2"><Building size={20} /> Informações Básicas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName" className={errors.companyName ? 'text-destructive font-semibold' : ''}>Razão Social / Nome da Empresa *</Label>
                <Input 
                  id="companyName" 
                  {...register("companyName")} 
                  placeholder="Ex: Restaurante Sabor Ltda"
                  aria-invalid={!!errors.companyName}
                  className={errors.companyName ? 'border-destructive ring-1 ring-destructive focus-visible:ring-destructive' : ''}
                />
                {errors.companyName && <p className="text-destructive text-sm">{errors.companyName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="tradeName">Nome Fantasia</Label>
                <Input id="tradeName" {...register("tradeName")} placeholder="Ex: Sabor & Cia" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="document" className={errors.document ? 'text-destructive font-semibold' : ''}>CPF / CNPJ</Label>
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="segment">Segmento</Label>
                <Controller
                  name="segment"
                  control={control}
                  render={({ field }) => (
                    <ComboboxCreatable
                      options={(settings?.preRegisteredSegments || []).map(s => ({ label: s, value: s }))}
                      value={field.value || ''}
                      onChange={field.onChange}
                      onCreateOption={handleCreateSegment}
                      placeholder="Ex: Restaurante, Padaria, etc."
                      emptyText="Nenhum segmento encontrado."
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Contato & Captação */}
          <div className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 border-b pb-2"><Phone size={20} /> Contato & Captação</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">Nome do Contato</Label>
                <Input id="contactName" {...register("contactName")} placeholder="Ex: João da Silva" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Controller
                  control={control}
                  name="whatsapp"
                  render={({ field: { onChange, onBlur, value, ref } }) => (
                    <IMaskInput
                      id="whatsapp"
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
              <div className="space-y-2">
                <Label htmlFor="email" className={errors.email ? 'text-destructive font-semibold' : ''}>E-mail</Label>
                <Input 
                  id="email" 
                  type="email" 
                  {...register("email")} 
                  placeholder="contato@empresa.com" 
                  className={errors.email ? 'border-destructive ring-1 ring-destructive focus-visible:ring-destructive' : ''}
                />
                {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sourceChannel">Canal de Origem</Label>
                <Input id="sourceChannel" {...register("sourceChannel")} placeholder="Ex: Instagram, Indicação, Cold Call" />
              </div>
            </div>
          </div>

          {/* Mapeamento */}
          {settings?.needsMappingConfig && settings.needsMappingConfig.length > 0 && (
            <div className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 border-b pb-2"><Target size={20} /> Mapeamento de Necessidades</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {settings.needsMappingConfig.map((config: any) => (
                  <div key={config.id} className={`space-y-2 ${config.type === 'textarea' ? 'md:col-span-2' : ''}`}>
                    <Label htmlFor={`ans_${config.id}`}>{config.label}</Label>
                    {config.type === 'textarea' ? (
                      <Textarea 
                        id={`ans_${config.id}`}
                        {...register(`needsMappingAnswers.ans_${config.id}`)} 
                        rows={3} 
                        className="resize-none"
                      />
                    ) : (
                      <Input 
                        type={config.type === 'number' ? 'number' : 'text'}
                        id={`ans_${config.id}`}
                        {...register(`needsMappingAnswers.ans_${config.id}`)} 
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4 bg-white p-4 rounded-xl border border-border shadow-sm sticky bottom-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
            <Button type="submit" size="lg" className="w-48 shadow-lg shadow-primary/30" disabled={mutation.isPending}>
              {mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : 'Salvar Lead'}
            </Button>
          </div>
          
          {mutation.isError && (
            <p className="text-destructive text-center font-medium bg-red-50 p-3 rounded-md border border-red-200 mt-4">
              Erro ao salvar: {mutation.error.message}
            </p>
          )}
        </form>
      </div>
    </RequirePermissions>
  );
}
