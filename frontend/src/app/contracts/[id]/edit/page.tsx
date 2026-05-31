'use client';

import { useState, useMemo, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Calculator, Building, Package } from 'lucide-react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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
  items: z.array(contractItemSchema).min(1, 'Adicione pelo menos um módulo'),
});

type ContractFormValues = z.infer<typeof contractSchema>;

export default function EditContractPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = use(params);

  const { data: contract, isLoading: isLoadingContract } = useQuery({
    queryKey: ['contract', id],
    queryFn: () => apiFetch(`/contracts/${id}`),
  });

  const { data: customers } = useQuery({ queryKey: ['customers'], queryFn: () => apiFetch('/customers') });
  const { data: products } = useQuery({ queryKey: ['products'], queryFn: () => apiFetch('/products') });

  const { register, control, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema) as any,
    defaultValues: {
      globalDiscount: 0,
      renewalMode: 'AUTOMATIC',
      items: [],
    }
  });

  const [initialProductLoaded, setInitialProductLoaded] = useState(false);

  useEffect(() => {
    if (contract && !initialProductLoaded) {
      if (contract.status !== 'DRAFT') {
        alert('Apenas contratos em RASCUNHO podem ser editados.');
        router.push('/contracts');
        return;
      }

      reset({
        customerId: contract.customerId,
        productId: contract.productId,
        globalDiscount: Number(contract.globalDiscount) || 0,
        renewalMode: contract.renewalMode,
        items: contract.items?.map((it: any) => ({
          moduleId: it.moduleId,
          quantity: it.quantity,
          discount: Number(it.discount) || 0,
        })) || [],
      });
      setInitialProductLoaded(true);
    }
  }, [contract, reset, router, initialProductLoaded]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const selectedProductId = watch('productId');
  const items = useWatch({ control, name: 'items' });
  const globalDiscount = useWatch({ control, name: 'globalDiscount' }) || 0;

  const selectedProduct = useMemo(() => {
    return products?.find((p: any) => p.id === selectedProductId);
  }, [selectedProductId, products]);

  // Limpa itens apenas se o produto mudar após a carga inicial
  useEffect(() => {
    if (initialProductLoaded && selectedProductId && contract && selectedProductId !== contract.productId) {
      // Se o usuario trocar o produto para um diferente do contrato atual
      // E verificar se já não limpou para não entrar em loop (o React Hook Form tem estado local)
      const currentFirstItem = items && items[0];
      const belongsToNewProduct = currentFirstItem && selectedProduct?.modules?.find((m: any) => m.id === currentFirstItem.moduleId);
      
      if (!belongsToNewProduct && items && items.length > 0) {
        setValue('items', []);
      }
    }
  }, [selectedProductId, initialProductLoaded, contract, selectedProduct, items, setValue]);

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
    mutationFn: (updatedContract: ContractFormValues) => apiFetch(`/contracts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedContract),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['contract', id] });
      router.push('/contracts');
    },
  });

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  if (isLoadingContract) return <div className="p-8 text-center">Carregando contrato...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-2">
        <FileText className="text-primary w-8 h-8" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Editar Contrato</h1>
          <p className="text-muted-foreground">Altere o rascunho do contrato antes da assinatura.</p>
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
                {products?.map((p: any) => (
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
                        {selectedProduct.modules?.map((m: any) => (
                          <option key={m.id} value={m.id}>{m.name} (R$ {Number(m.price).toFixed(2)}) {m.isActive ? '' : '(Inativo)'}</option>
                        ))}
                      </select>
                      {errors.items?.[index]?.moduleId && <p className="text-destructive text-xs font-medium">{errors.items[index]?.moduleId?.message}</p>}
                    </div>
                    
                    <div className="space-y-2 col-span-2">
                      <Label className="text-slate-700 font-medium">Quantidade</Label>
                      <Input type="number" min="1" className="h-10 bg-white border-slate-300 text-slate-900 focus-visible:ring-primary" {...register(`items.${index}.quantity`)} />
                    </div>
                    
                    <div className="space-y-2 col-span-3">
                      <Label className="text-slate-700 font-medium">Desconto Unit. (R$)</Label>
                      <Input type="number" step="0.01" min="0" className="h-10 bg-white border-slate-300 text-slate-900 focus-visible:ring-primary" {...register(`items.${index}.discount`)} />
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
                <Input type="number" step="0.01" min="0" className="h-10 bg-white border-slate-300 text-slate-900 focus-visible:ring-primary" {...register('globalDiscount')} />
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
              {mutation.isPending ? 'Salvando...' : 'Salvar Rascunho'}
            </Button>
          </div>
        </div>
        
        {mutation.isError && (
          <p className="text-destructive text-center font-medium bg-red-50 p-3 rounded-md border border-red-200">
            Erro ao salvar contrato: {mutation.error?.message}
          </p>
        )}
      </form>
    </div>
  );
}
