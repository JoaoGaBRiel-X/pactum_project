'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Calculator, Building, Package } from 'lucide-react';
import { useForm, useFieldArray, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { IMaskInput } from 'react-imask';

const contractItemSchema = z.object({
  moduleId: z.string().min(1, 'Selecione um módulo'),
  quantity: z.coerce.number().min(1, 'Quantidade inválida'),
  discount: z.coerce.number().min(0).default(0),
});

const contractSchema = z.object({
  customerId: z.string().min(1, 'Selecione o Cliente'),
  productId: z.string().min(1, 'Selecione o Produto'),
  globalDiscount: z.coerce.number().min(0).default(0),
  renewalMode: z.enum(['AUTOMATIC', 'MANUAL']).default('AUTOMATIC'),
  adjustmentIndexId: z.string().optional(),
  items: z.array(contractItemSchema).min(1, 'Adicione pelo menos um módulo'),
});

type ContractFormValues = z.infer<typeof contractSchema>;

export default function NewContractPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: customers } = useQuery({ queryKey: ['customers'], queryFn: () => apiFetch('/customers') });
  const { data: products } = useQuery({ queryKey: ['products'], queryFn: () => apiFetch('/products') });
  const { data: indexes } = useQuery({ queryKey: ['adjustments-indexes'], queryFn: () => apiFetch('/adjustments/indexes') });

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema) as any,
    defaultValues: {
      globalDiscount: 0,
      renewalMode: 'AUTOMATIC',
      items: [],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const selectedProductId = watch('productId');
  const items = useWatch({ control, name: 'items' });
  const globalDiscount = useWatch({ control, name: 'globalDiscount' }) || 0;

  // Encontra o produto selecionado para buscar os modulos e precos
  const selectedProduct = useMemo(() => {
    return products?.find((p: any) => p.id === selectedProductId);
  }, [selectedProductId, products]);

  // Se mudar o produto, limpa os itens
  useEffect(() => {
    setValue('items', []);
  }, [selectedProductId, setValue]);

  // Calculadora em tempo real
  const totalValue = useMemo(() => {
    if (!selectedProduct) return 0;
    const itemsTotal = items.reduce((acc, item) => {
      const module = selectedProduct.modules?.find((m: any) => m.id === item.moduleId);
      const price = module ? Number(module.price) : 0;
      return acc + ((price - (item.discount || 0)) * (item.quantity || 1));
    }, 0);
    return Math.max(0, itemsTotal - globalDiscount);
  }, [items, globalDiscount, selectedProduct]);

  const mutation = useMutation({
    mutationFn: (newContract: ContractFormValues) => apiFetch('/contracts', {
      method: 'POST',
      body: JSON.stringify(newContract),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      router.push('/contracts');
    },
  });

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-2">
        <FileText className="text-primary w-8 h-8" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Novo Contrato</h1>
          <p className="text-muted-foreground">Vincule um cliente a um produto e selecione os módulos ativos.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Passo 1: Seleção de Entidades */}
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 border-b pb-2"><Building size={20} /> Entidades</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">Cliente *</Label>
              <select {...register('customerId')} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <option value="">Selecione o Cliente</option>
                {customers?.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.corporateName} ({c.document})</option>
                ))}
              </select>
              {errors.customerId && <p className="text-destructive text-sm font-medium">{errors.customerId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">Produto Base *</Label>
              <select {...register('productId')} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <option value="">Selecione o Produto</option>
                {products?.filter((p:any) => p.isActive).map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {errors.productId && <p className="text-destructive text-sm font-medium">{errors.productId.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">Modo de Renovação</Label>
              <select {...register('renewalMode')} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <option value="AUTOMATIC">Automática (Aplica índice financeiro)</option>
                <option value="MANUAL">Manual (Exige aprovação)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">Índice de Reajuste</Label>
              <select {...register('adjustmentIndexId')} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <option value="">Nenhum (Sem Reajuste)</option>
                {indexes?.map((idx: any) => (
                  <option key={idx.id} value={idx.id}>{idx.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Passo 2: Módulos e Valores */}
        {selectedProduct && (
          <div className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-lg font-semibold flex items-center gap-2"><Package size={20} /> Montagem do Pacote</h2>
              <Button type="button" variant="outline" size="sm" onClick={() => append({ moduleId: '', quantity: 1, discount: 0 })}>
                Adicionar Módulo
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => {
                const currentModuleId = items[index]?.moduleId;
                const moduleObj = selectedProduct.modules?.find((m:any) => m.id === currentModuleId);
                const price = moduleObj ? Number(moduleObj.price) : 0;
                const discount = items[index]?.discount || 0;
                const qty = items[index]?.quantity || 1;
                const lineTotal = Math.max(0, (price - discount) * qty);

                return (
                  <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-slate-50 p-4 rounded-lg border border-border">
                    <div className="space-y-2 col-span-4">
                      <Label className="text-slate-700 font-medium">Módulo</Label>
                      <select {...register(`items.${index}.moduleId`)} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                        <option value="">Selecione...</option>
                        {selectedProduct.modules?.filter((m:any) => m.isActive).map((m: any) => (
                          <option key={m.id} value={m.id}>{m.name} (R$ {Number(m.price).toFixed(2)})</option>
                        ))}
                      </select>
                      {errors.items?.[index]?.moduleId && <p className="text-destructive text-xs font-medium">{errors.items[index]?.moduleId?.message}</p>}
                    </div>
                    
                    <div className="space-y-2 col-span-2">
                      <Label className="text-slate-700 font-medium">Quantidade</Label>
                      <Controller
                        control={control}
                        name={`items.${index}.quantity`}
                        render={({ field: { onChange, onBlur, value, ref } }) => (
                          <IMaskInput
                            mask={Number}
                            scale={0}
                            min={1}
                            unmask={true}
                            onAccept={(val) => onChange(val)}
                            onBlur={onBlur}
                            value={String(value || '')}
                            inputRef={ref}
                            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          />
                        )}
                      />
                    </div>
                    
                    <div className="space-y-2 col-span-3">
                      <Label className="text-slate-700 font-medium">Desconto Unit. (R$)</Label>
                      <Controller
                        control={control}
                        name={`items.${index}.discount`}
                        render={({ field: { onChange, onBlur, value, ref } }) => (
                          <IMaskInput
                            mask={Number}
                            scale={2}
                            padFractionalZeros={true}
                            normalizeZeros={true}
                            radix=","
                            mapToRadix={['.']}
                            min={0}
                            unmask={'typed'}
                            onAccept={(val) => onChange(val)}
                            onBlur={onBlur}
                            value={String(value || '0')}
                            inputRef={ref}
                            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          />
                        )}
                      />
                    </div>

                    <div className="col-span-2 pb-2 text-right">
                      <div className="text-xs text-muted-foreground">Subtotal</div>
                      <div className="font-semibold text-slate-800">R$ {lineTotal.toFixed(2)}</div>
                    </div>

                    <div className="col-span-1 pb-1">
                      <Button type="button" variant="ghost" className="text-destructive hover:bg-red-100" size="sm" onClick={() => remove(index)}>Remover</Button>
                    </div>
                  </div>
                );
              })}
              {errors.items?.root && <p className="text-destructive text-sm">{errors.items.root.message}</p>}
              {fields.length === 0 && <p className="text-sm text-muted-foreground italic">Nenhum módulo adicionado ao contrato.</p>}
            </div>
            
            <div className="flex justify-end pt-4 border-t">
              <div className="w-1/3 space-y-2">
                <Label className="text-slate-700 font-medium">Desconto Global (R$)</Label>
                <Controller
                  control={control}
                  name="globalDiscount"
                  render={({ field: { onChange, onBlur, value, ref } }) => (
                    <IMaskInput
                      mask={Number}
                      scale={2}
                      padFractionalZeros={true}
                      normalizeZeros={true}
                      radix=","
                      mapToRadix={['.']}
                      min={0}
                      unmask={'typed'}
                      onAccept={(val) => onChange(val)}
                      onBlur={onBlur}
                      value={String(value || '0')}
                      inputRef={ref}
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  )}
                />
              </div>
            </div>
          </div>
        )}

        {/* Resumo */}
        <div className="flex items-center justify-between bg-slate-900 text-white p-6 rounded-xl shadow-xl sticky bottom-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-lg">
              <Calculator size={28} className="text-blue-400" />
            </div>
            <div>
              <div className="text-slate-300 text-sm font-medium">Valor Total Recorrente</div>
              <div className="text-4xl font-bold tracking-tight text-white">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>
          <div className="flex gap-4">
            <Button type="button" variant="outline" className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white" onClick={() => router.back()}>Cancelar</Button>
            <Button type="submit" size="lg" className="bg-blue-600 text-white hover:bg-blue-500 shadow-lg" disabled={mutation.isPending || !selectedProduct || fields.length === 0}>
              {mutation.isPending ? 'Gerando...' : 'Gerar Contrato'}
            </Button>
          </div>
        </div>
        
        {mutation.isError && (
          <p className="text-destructive text-center font-medium bg-red-50 p-3 rounded-md border border-red-200">
            Erro ao gerar contrato: {mutation.error.message}
          </p>
        )}
      </form>
    </div>
  );
}
