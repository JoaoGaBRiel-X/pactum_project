'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash, Users, Building, Mail, Phone, Briefcase } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const contactSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  role: z.string().optional(),
});

const partnerSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  document: z.string().min(11, 'Documento inválido'),
  percentage: z.coerce.number().min(0).max(100).optional(),
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

  const { register, control, handleSubmit, formState: { errors } } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
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

  const onSubmit = (data: CustomerFormValues) => {
    mutation.mutate(data);
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
              <Input id="document" {...register("document")} placeholder="00.000.000/0001-00" />
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
                  <Input {...register(`contacts.${index}.phone`)} placeholder="(11) 99999-9999" />
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
            <Button type="button" variant="outline" size="sm" onClick={() => appendPartner({ name: '', document: '', percentage: 0 })}>
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
                  <Input {...register(`partners.${index}.document`)} placeholder="Documento" />
                  {errors.partners?.[index]?.document && <p className="text-destructive text-xs">{errors.partners[index]?.document?.message}</p>}
                </div>
                <div className="flex gap-2 items-end">
                  <div className="space-y-2 flex-1">
                    <Label>% Participação</Label>
                    <Input type="number" {...register(`partners.${index}.percentage`)} placeholder="%" />
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
