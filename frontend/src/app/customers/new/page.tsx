'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash, Users, Building, Mail, Phone, Briefcase } from 'lucide-react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { IMaskInput } from 'react-imask';

const formatCnpj = (value: string) => {
  const v = value.replace(/\D/g, '').slice(0, 14);
  if (v.length === 14) {
    return v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  }
  return v; // While typing, you might want a dynamic mask, but for simplicity we let them type numbers and format at 14, or format dynamically:
};

const dynamicCnpjMask = (value: string) => {
  let v = value.replace(/\D/g, '');
  if (v.length > 14) v = v.slice(0, 14);
  v = v.replace(/^(\d{2})(\d)/, '$1.$2');
  v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
  v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
  v = v.replace(/(\d{4})(\d)/, '$1-$2');
  return v;
};


const contactSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  role: z.string().optional(),
});

const partnerSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  document: z.string().min(11, 'Documento inválido'),
  share: z.coerce.number().min(0).max(100).optional(),
});

const customerSchema = z.object({
  document: z.string().min(14, 'CNPJ é obrigatório (14 dígitos mínimo)'),
  corporateName: z.string().min(2, 'Razão Social é obrigatória'),
  tradeName: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  contacts: z.array(contactSchema).optional(),
  partners: z.array(partnerSchema).optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export default function NewCustomerPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { register, control, handleSubmit, setValue, formState: { errors } } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema) as any,
    defaultValues: {
      contacts: [],
      partners: [],
    }
  });

  const { fields: contactFields, append: appendContact, remove: removeContact } = useFieldArray({
    control,
    name: "contacts",
  });

  const { fields: partnerFields, append: appendPartner, remove: removePartner } = useFieldArray({
    control,
    name: "partners",
  });

  const searchCnpj = async (cnpj: string) => {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    if (cleanCnpj.length !== 14) return;
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
      if (res.ok) {
        const data = await res.json();
        setValue('corporateName', data.razao_social || '');
        setValue('tradeName', data.nome_fantasia || '');
        
        if (data.qsa && Array.isArray(data.qsa)) {
          // Clear current partners and add new ones
          setValue('partners', []);
          data.qsa.forEach((socio: any) => {
            appendPartner({
              name: socio.nome_socio,
              document: socio.cnpj_cpf_do_socio || '',
              share: 0
            });
          });
        }
      }
    } catch (err) {
      console.error("Erro ao buscar CNPJ na BrasilAPI", err);
    }
  };

  const mutation = useMutation({
    mutationFn: (newCustomer: CustomerFormValues) => apiFetch('/customers', {
      method: 'POST',
      body: JSON.stringify(newCustomer),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      router.push('/customers');
    },
  });

  const onSubmit = (data: any) => {
    const payload = {
      ...data,
      document: data.document.replace(/\D/g, '') // Send only numbers to backend
    };
    mutation.mutate(payload);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-2">
        <Building className="text-primary w-8 h-8" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Novo Cliente</h1>
          <p className="text-muted-foreground">Cadastre os dados principais, contatos e quadro societário.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Dados Básicos */}
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 border-b pb-2"><Building size={20} /> Dados Principais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="document">CNPJ *</Label>
              <Controller
                control={control}
                name="document"
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <IMaskInput
                    mask={[
                      { mask: '000.000.000-00' },
                      { mask: '00.000.000/0000-00' }
                    ]}
                    unmask={true}
                    onAccept={(val) => {
                      onChange(val);
                      if (val.length === 14) searchCnpj(val);
                    }}
                    onBlur={(e) => {
                      onBlur();
                      if (value && value.length === 14) searchCnpj(value);
                    }}
                    value={value || ''}
                    inputRef={ref}
                    placeholder="00.000.000/0001-00"
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                )}
              />
              {errors.document && <p className="text-destructive text-sm">{errors.document.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="corporateName">Razão Social *</Label>
              <Input id="corporateName" {...register("corporateName")} placeholder="Nome da Empresa LTDA" />
              {errors.corporateName && <p className="text-destructive text-sm">{errors.corporateName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tradeName">Nome Fantasia</Label>
              <Input id="tradeName" {...register("tradeName")} placeholder="Nome Fantasia" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail Principal</Label>
              <Input id="email" type="email" {...register("email")} placeholder="contato@empresa.com" />
            </div>
          </div>
        </div>

        {/* Contatos */}
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Phone size={20} /> Contatos</h2>
            <Button type="button" variant="outline" size="sm" onClick={() => appendContact({ name: '', email: '', phone: '', role: '' })}>
              <Plus size={16} className="mr-2" /> Adicionar Contato
            </Button>
          </div>
          
          {contactFields.length === 0 && <p className="text-muted-foreground text-sm italic">Nenhum contato adicionado.</p>}
          
          <div className="space-y-4">
            {contactFields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end bg-slate-50 p-4 rounded-lg border border-border">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input {...register(`contacts.${index}.name`)} placeholder="Nome" />
                  {errors.contacts?.[index]?.name && <p className="text-destructive text-xs">{errors.contacts[index]?.name?.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Cargo</Label>
                  <Input {...register(`contacts.${index}.role`)} placeholder="Ex: Financeiro" />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Controller
                    control={control}
                    name={`contacts.${index}.phone`}
                    render={({ field: { onChange, onBlur, value, ref } }) => (
                      <IMaskInput
                        mask={[
                          { mask: '(00) 0000-0000' },
                          { mask: '(00) 00000-0000' }
                        ]}
                        unmask={true}
                        onAccept={(val) => onChange(val)}
                        onBlur={onBlur}
                        value={value || ''}
                        inputRef={ref}
                        placeholder="(11) 99999-9999"
                        className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input type="email" {...register(`contacts.${index}.email`)} placeholder="email@empresa.com" />
                </div>
                <Button type="button" variant="destructive" size="icon" onClick={() => removeContact(index)}>
                  <Trash size={16} />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Sócios */}
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Users size={20} /> Sócios</h2>
            <Button type="button" variant="outline" size="sm" onClick={() => appendPartner({ name: '', document: '', share: 0 })}>
              <Plus size={16} className="mr-2" /> Adicionar Sócio
            </Button>
          </div>

          {partnerFields.length === 0 && <p className="text-muted-foreground text-sm italic">Nenhum sócio adicionado.</p>}

          <div className="space-y-4">
            {partnerFields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-slate-50 p-4 rounded-lg border border-border">
                <div className="space-y-2 col-span-2">
                  <Label>Nome</Label>
                  <Input {...register(`partners.${index}.name`)} placeholder="Nome do Sócio" />
                  {errors.partners?.[index]?.name && <p className="text-destructive text-xs">{errors.partners[index]?.name?.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>CPF/CNPJ</Label>
                  <Controller
                    control={control}
                    name={`partners.${index}.document`}
                    render={({ field: { onChange, onBlur, value, ref } }) => (
                      <IMaskInput
                        mask={[
                          { mask: '000.000.000-00' },
                          { mask: '00.000.000/0000-00' }
                        ]}
                        unmask={true}
                        onAccept={(val) => onChange(val)}
                        onBlur={onBlur}
                        value={value || ''}
                        inputRef={ref}
                        placeholder="Documento"
                        className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    )}
                  />
                  {errors.partners?.[index]?.document && <p className="text-destructive text-xs">{errors.partners[index]?.document?.message}</p>}
                </div>
                <div className="flex gap-2 items-end">
                  <div className="space-y-2 flex-1">
                    <Label>% Participação</Label>
                    <Controller
                      control={control}
                      name={`partners.${index}.share`}
                      render={({ field: { onChange, onBlur, value, ref } }) => (
                        <IMaskInput
                          mask={Number}
                          scale={2}
                          padFractionalZeros={true}
                          normalizeZeros={true}
                          radix=","
                          mapToRadix={['.']}
                          min={0}
                          max={100}
                          unmask={'typed'}
                          onAccept={(val) => onChange(val)}
                          onBlur={onBlur}
                          value={String(value || '')}
                          inputRef={ref}
                          placeholder="%"
                          className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        />
                      )}
                    />
                  </div>
                  <Button type="button" variant="destructive" size="icon" onClick={() => removePartner(index)}>
                    <Trash size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4 bg-white p-4 rounded-xl border border-border shadow-sm sticky bottom-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" size="lg" className="w-48 shadow-lg shadow-primary/30" disabled={mutation.isPending}>
            {mutation.isPending ? 'Salvando...' : 'Salvar Cliente'}
          </Button>
        </div>
        
        {mutation.isError && (
          <p className="text-destructive text-center font-medium bg-red-50 p-3 rounded-md border border-red-200">
            Erro ao salvar: {mutation.error.message}
          </p>
        )}
      </form>
    </div>
  );
}
