'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash, Users, Building, Mail, Phone, Briefcase, Loader2 } from 'lucide-react';
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
  cpf: z.string().optional(),
  role: z.string().optional(),
  portalAccess: z.boolean().optional(),
});

const partnerSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  document: z.string().min(11, 'Documento inválido'),
  share: z.coerce.number().min(0).max(100).optional(),
  isLegalRep: z.boolean().optional(),
});

const legalRepresentativeSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  cpf: z.string().min(11, 'CPF inválido'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
});

const customerSchema = z.object({
  document: z.string().min(14, 'CNPJ é obrigatório (14 dígitos mínimo)'),
  corporateName: z.string().min(2, 'Razão Social é obrigatória'),
  tradeName: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  zipCode: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  corporateGroupId: z.string().optional(),
  contacts: z.array(contactSchema).optional(),
  partners: z.array(partnerSchema).optional(),
  legalRepresentatives: z.array(legalRepresentativeSchema).optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export default function NewCustomerPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: corporateGroups } = useQuery({
    queryKey: ['corporate-groups'],
    queryFn: () => apiFetch('/corporate-groups'),
  });

  const { register, control, handleSubmit, setValue, formState: { errors } } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema) as any,
    mode: 'onTouched',
    defaultValues: {
      contacts: [],
      partners: [],
      legalRepresentatives: [],
    }
  });

  const { fields: contactFields, append: appendContact, remove: removeContact } = useFieldArray({
    control,
    name: "contacts",
  });

  const { fields: partnerFields, append: appendPartner, remove: removePartner, replace: replacePartners } = useFieldArray({
    control,
    name: "partners",
  });

  const { fields: legalRepFields, append: appendLegalRep, remove: removeLegalRep } = useFieldArray({
    control,
    name: "legalRepresentatives",
  });

  const [isFetchingCnpj, setIsFetchingCnpj] = useState(false);

  const searchCnpj = async (cnpj: string) => {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    if (cleanCnpj.length !== 14) return;
    
    setIsFetchingCnpj(true);
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
      if (res.ok) {
        const data = await res.json();
        setValue('corporateName', data.razao_social || '');
        setValue('tradeName', data.nome_fantasia || '');
        setValue('zipCode', data.cep || '');
        setValue('street', data.logradouro || '');
        setValue('number', data.numero || '');
        setValue('complement', data.complemento || '');
        setValue('neighborhood', data.bairro || '');
        setValue('city', data.municipio || '');
        setValue('state', data.uf || '');
        
        if (data.qsa && Array.isArray(data.qsa)) {
          const newPartners = data.qsa.map((socio: any) => ({
            name: socio.nome_socio,
            document: socio.cnpj_cpf_do_socio || '',
            share: 0,
            isLegalRep: false,
          }));
          replacePartners(newPartners);
        }
      }
    } catch (err) {
      console.error("Erro ao buscar CNPJ na BrasilAPI", err);
    } finally {
      setIsFetchingCnpj(false);
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
      document: data.document.replace(/\D/g, ''), // Send only numbers to backend
      contacts: data.contacts?.map(({ id, ...rest }: any) => rest),
      partners: data.partners?.map(({ id, ...rest }: any) => rest),
      legalRepresentatives: data.legalRepresentatives?.map(({ id, ...rest }: any) => rest),
    };
    if (!payload.corporateGroupId) {
      delete payload.corporateGroupId; // Remove empty string so it doesn't fail validation
    }
    mutation.mutate(payload);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
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
              <Label htmlFor="document" className={`flex items-center gap-2 ${errors.document ? 'text-destructive font-semibold' : ''}`}>
                CNPJ * 
                {isFetchingCnpj && <span className="text-xs text-primary animate-pulse">Buscando dados na Receita Federal...</span>}
              </Label>
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
                    disabled={isFetchingCnpj}
                    aria-invalid={!!errors.document}
                    aria-describedby={errors.document ? "document-error" : undefined}
                    className={`flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 ${errors.document ? 'border-destructive ring-1 ring-destructive focus-visible:ring-destructive' : 'border-slate-300 focus-visible:ring-primary'}`}
                  />
                )}
              />
              {errors.document && <p id="document-error" className="text-destructive text-sm">{errors.document.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="corporateName" className={errors.corporateName ? 'text-destructive font-semibold' : ''}>Razão Social *</Label>
              <Input 
                id="corporateName" 
                {...register("corporateName")} 
                placeholder="Nome da Empresa LTDA"
                aria-invalid={!!errors.corporateName}
                aria-describedby={errors.corporateName ? "corporateName-error" : undefined}
                className={errors.corporateName ? 'border-destructive ring-1 ring-destructive focus-visible:ring-destructive' : ''}
              />
              {errors.corporateName && <p id="corporateName-error" className="text-destructive text-sm">{errors.corporateName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tradeName">Nome Fantasia</Label>
              <Input id="tradeName" {...register("tradeName")} placeholder="Nome Fantasia" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail Principal</Label>
              <Input id="email" type="email" {...register("email")} placeholder="contato@empresa.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Controller
                control={control}
                name="phone"
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
                    placeholder="(00) 00000-0000"
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                )}
              />
            </div>
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label htmlFor="corporateGroupId">Grupo Econômico (Opcional)</Label>
              <select 
                id="corporateGroupId" 
                {...register("corporateGroupId")}
                disabled={!corporateGroups}
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
              >
                <option value="">{corporateGroups ? 'Nenhum' : 'Carregando...'}</option>
                {corporateGroups?.map((group: any) => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <h2 className="text-lg font-semibold flex items-center gap-2 border-b pb-2 pt-4">Endereço</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>CEP</Label>
              <Controller
                control={control}
                name="zipCode"
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <IMaskInput
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
            <div className="space-y-2 md:col-span-2">
              <Label>Logradouro</Label>
              <Input {...register("street")} placeholder="Rua / Avenida" />
            </div>
            <div className="space-y-2">
              <Label>Número</Label>
              <Input {...register("number")} placeholder="123" />
            </div>
            <div className="space-y-2">
              <Label>Complemento</Label>
              <Input {...register("complement")} placeholder="Sala, Andar, etc" />
            </div>
            <div className="space-y-2">
              <Label>Bairro</Label>
              <Input {...register("neighborhood")} placeholder="Bairro" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Cidade</Label>
              <Input {...register("city")} placeholder="Cidade" />
            </div>
            <div className="space-y-2">
              <Label>UF</Label>
              <Input {...register("state")} placeholder="SP" maxLength={2} />
            </div>
          </div>
        </div>

        {/* Contatos */}
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Phone size={20} /> Contatos</h2>
            <Button type="button" variant="outline" size="sm" onClick={() => appendContact({ name: '', email: '', phone: '', cpf: '', role: '' })}>
              <Plus size={16} className="mr-2" /> Adicionar Contato
            </Button>
          </div>
          
          {contactFields.length === 0 && <p className="text-muted-foreground text-sm italic">Nenhum contato adicionado.</p>}
          
          <div className="space-y-4">
            {contactFields.map((field, index) => (
              <div key={field.id} className="flex flex-col gap-4 bg-slate-50 p-5 rounded-lg border border-border">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="space-y-2 md:col-span-4">
                    <Label className={errors.contacts?.[index]?.name ? 'text-destructive font-semibold' : ''}>Nome</Label>
                    <Input 
                      {...register(`contacts.${index}.name`)} 
                      placeholder="Nome" 
                      className={errors.contacts?.[index]?.name ? 'border-destructive ring-1 ring-destructive focus-visible:ring-destructive' : ''}
                    />
                    {errors.contacts?.[index]?.name && <p className="text-destructive text-xs">{errors.contacts[index]?.name?.message}</p>}
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <Label>Cargo</Label>
                    <Input {...register(`contacts.${index}.role`)} placeholder="Ex: Financeiro" />
                  </div>
                  <div className="space-y-2 md:col-span-5 flex items-end">
                    <div className="flex-1 space-y-2">
                      <Label>E-mail</Label>
                      <Input type="email" {...register(`contacts.${index}.email`)} placeholder="email@empresa.com" />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <div className="space-y-2 md:col-span-3">
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
                  <div className="space-y-2 md:col-span-3">
                    <Label>CPF</Label>
                    <Controller
                      control={control}
                      name={`contacts.${index}.cpf`}
                      render={({ field: { onChange, onBlur, value, ref } }) => (
                        <IMaskInput
                          mask="000.000.000-00"
                          unmask={true}
                          onAccept={(val) => onChange(val)}
                          onBlur={onBlur}
                          value={value || ''}
                          inputRef={ref}
                          placeholder="000.000.000-00"
                          className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        />
                      )}
                    />
                  </div>
                  <div className="md:col-span-6 flex items-center justify-between md:justify-end gap-4 h-10 w-full">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id={`portalAccess-${index}`}
                        {...register(`contacts.${index}.portalAccess`)} 
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <Label htmlFor={`portalAccess-${index}`} className="cursor-pointer text-sm font-medium text-slate-700 whitespace-nowrap">
                        Acesso ao Portal
                      </Label>
                    </div>
                    <Button type="button" variant="destructive" size="icon" onClick={() => removeContact(index)} className="shrink-0">
                      <Trash size={16} />
                    </Button>
                  </div>
                </div>
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
              <div key={field.id} className="flex flex-col md:flex-row gap-4 items-start md:items-end bg-slate-50 p-5 rounded-lg border border-border">
                <div className="space-y-2 flex-1 w-full">
                  <Label className={errors.partners?.[index]?.name ? 'text-destructive font-semibold' : ''}>Nome</Label>
                  <Input 
                    {...register(`partners.${index}.name`)} 
                    placeholder="Nome do Sócio" 
                    className={errors.partners?.[index]?.name ? 'border-destructive ring-1 ring-destructive focus-visible:ring-destructive' : ''}
                  />
                  {errors.partners?.[index]?.name && <p className="text-destructive text-xs">{errors.partners[index]?.name?.message}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-4 w-full md:w-auto flex-1">
                  <div className="space-y-2">
                  <Label className={errors.partners?.[index]?.document ? 'text-destructive font-semibold' : ''}>CPF/CNPJ</Label>
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
                        className={`flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 ${errors.partners?.[index]?.document ? 'border-destructive ring-1 ring-destructive focus-visible:ring-destructive' : 'border-slate-300 focus-visible:ring-primary'}`}
                      />
                    )}
                  />
                  {errors.partners?.[index]?.document && <p className="text-destructive text-xs">{errors.partners[index]?.document?.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="whitespace-nowrap overflow-hidden text-ellipsis">% Participação</Label>
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
                </div>
                
                <div className="flex items-center justify-between w-full md:w-auto h-10 gap-4">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id={`isLegalRep-${index}`}
                      {...register(`partners.${index}.isLegalRep`)} 
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <Label htmlFor={`isLegalRep-${index}`} className="cursor-pointer text-sm font-medium text-slate-700 whitespace-nowrap">
                      É Rep. Legal (Assina)
                    </Label>
                  </div>
                  <Button type="button" variant="destructive" size="icon" onClick={() => removePartner(index)} className="shrink-0">
                    <Trash size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Representantes Legais (Não Sócios) */}
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b pb-2">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2"><Building size={20} /> Representantes Legais (Não Sócios)</h2>
              <p className="text-sm text-slate-500 mt-1">Procuradores ou diretores autorizados a assinar contratos pela empresa.</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => appendLegalRep({ name: '', cpf: '', email: '', phone: '' })}>
              <Plus size={16} className="mr-2" /> Adicionar Representante
            </Button>
          </div>

          {legalRepFields.length === 0 && <p className="text-muted-foreground text-sm italic">Nenhum representante legal externo adicionado.</p>}

          <div className="space-y-4">
            {legalRepFields.map((field, index) => (
              <div key={field.id} className="flex flex-col gap-4 bg-slate-50 p-5 rounded-lg border border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className={errors.legalRepresentatives?.[index]?.name ? 'text-destructive font-semibold' : ''}>Nome</Label>
                    <Input 
                      {...register(`legalRepresentatives.${index}.name`)} 
                      placeholder="Nome" 
                      className={errors.legalRepresentatives?.[index]?.name ? 'border-destructive ring-1 ring-destructive focus-visible:ring-destructive' : ''}
                    />
                    {errors.legalRepresentatives?.[index]?.name && <p className="text-destructive text-xs">{errors.legalRepresentatives[index]?.name?.message}</p>}
                  </div>
                  <div className="space-y-2">
                  <Label className={errors.legalRepresentatives?.[index]?.cpf ? 'text-destructive font-semibold' : ''}>CPF</Label>
                  <Controller
                    control={control}
                    name={`legalRepresentatives.${index}.cpf`}
                    render={({ field: { onChange, onBlur, value, ref } }) => (
                      <IMaskInput
                        mask="000.000.000-00"
                        unmask={true}
                        onAccept={(val) => onChange(val)}
                        onBlur={onBlur}
                        value={value || ''}
                        inputRef={ref}
                        placeholder="CPF"
                        className={`flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 ${errors.legalRepresentatives?.[index]?.cpf ? 'border-destructive ring-1 ring-destructive focus-visible:ring-destructive' : 'border-slate-300 focus-visible:ring-primary'}`}
                      />
                    )}
                  />
                  {errors.legalRepresentatives?.[index]?.cpf && <p className="text-destructive text-xs">{errors.legalRepresentatives[index]?.cpf?.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <div className="space-y-2 md:col-span-4">
                    <Label>Telefone</Label>
                    <Controller
                      control={control}
                      name={`legalRepresentatives.${index}.phone`}
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
                          placeholder="Telefone"
                          className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        />
                      )}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-6 flex-1">
                    <Label>E-mail</Label>
                    <Input type="email" {...register(`legalRepresentatives.${index}.email`)} placeholder="email@empresa.com" />
                  </div>
                  <div className="md:col-span-2 flex justify-end h-10 pb-0">
                    <Button type="button" variant="destructive" size="icon" onClick={() => removeLegalRep(index)} className="shrink-0 w-full md:w-10">
                      <Trash size={16} className="md:hidden mr-2" />
                      <span className="md:hidden">Remover</span>
                      <Trash size={16} className="hidden md:block" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4 bg-white p-4 rounded-xl border border-border shadow-sm sticky bottom-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" size="lg" className="w-48 shadow-lg shadow-primary/30" disabled={mutation.isPending}>
            {mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : 'Salvar Cliente'}
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
