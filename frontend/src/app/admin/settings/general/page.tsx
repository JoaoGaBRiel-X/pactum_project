"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { tenantSettingsApi } from "@/services/tenant-settings-api";
import { maskCNPJ, maskCPF, maskCEP, maskPhone } from "@/lib/masks";
import { Search, Loader2 } from "lucide-react";

const settingsSchema = z.object({
  name: z.string().min(3, "Razão social é obrigatória"),
  tradeName: z.string().optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Domínio deve conter apenas letras minúsculas, números e hifens").optional().or(z.literal("")),
  document: z.string().min(14, "Documento inválido"), // CNPJ tem no mínimo 14 com a mascara (18)
  legalRepName: z.string().optional(),
  legalRepCpf: z.string().optional(),
  zipCode: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  supportEmail: z.string().email("E-mail inválido").optional().or(z.literal("")),
  supportPhone: z.string().optional(),
  billingCutoffStrategy: z.enum(['GLOBAL', 'PER_CONTRACT', 'PER_PRODUCT_GROUP']).optional().default('GLOBAL'),
  globalCutoffDay: z.coerce.number().min(1).max(31).optional().default(15),
  allowActivationWithoutDocument: z.boolean().optional().default(false),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function GeneralSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [searchingCNPJ, setSearchingCNPJ] = useState(false);
  const [searchingCEP, setSearchingCEP] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema) as any,
    defaultValues: {
      name: "",
      tradeName: "",
      slug: "",
      document: "",
      legalRepName: "",
      legalRepCpf: "",
      zipCode: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      supportEmail: "",
      supportPhone: "",
      billingCutoffStrategy: "GLOBAL",
      globalCutoffDay: 15,
      allowActivationWithoutDocument: false,
    },
  });

  useEffect(() => {
    async function load() {
      try {
        const data = await tenantSettingsApi.getSettings();
        form.reset({
          name: data.name || "",
          tradeName: data.tradeName || "",
          slug: (data as any).slug || "",
          document: data.document || "",
          legalRepName: data.legalRepName || "",
          legalRepCpf: data.legalRepCpf || "",
          zipCode: data.zipCode || "",
          street: data.street || "",
          number: data.number || "",
          complement: data.complement || "",
          neighborhood: data.neighborhood || "",
          city: data.city || "",
          state: data.state || "",
          supportEmail: data.supportEmail || "",
          supportPhone: data.supportPhone || "",
          billingCutoffStrategy: data.billingCutoffStrategy || "GLOBAL",
          globalCutoffDay: data.globalCutoffDay || 15,
          allowActivationWithoutDocument: data.allowActivationWithoutDocument || false,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [form]);

  async function onSubmit(data: SettingsFormValues) {
    try {
      await tenantSettingsApi.updateSettings(data);
      alert("Configurações salvas com sucesso!");
    } catch (err) {
      alert("Erro ao salvar as configurações");
    }
  }

  const handleCnpjSearch = async () => {
    const cnpj = form.getValues("document").replace(/\D/g, "");
    if (cnpj.length !== 14) return;

    setSearchingCNPJ(true);
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
      if (!res.ok) throw new Error("CNPJ não encontrado");
      const data = await res.json();
      
      form.setValue("name", data.razao_social || "");
      form.setValue("tradeName", data.nome_fantasia || data.razao_social || "");
      
      if (data.cep) {
        form.setValue("zipCode", maskCEP(data.cep));
        form.setValue("street", data.logradouro || "");
        form.setValue("number", data.numero || "");
        form.setValue("complement", data.complemento || "");
        form.setValue("neighborhood", data.bairro || "");
        form.setValue("city", data.municipio || "");
        form.setValue("state", data.uf || "");
      }
      
      if (data.ddd_telefone_1) {
        form.setValue("supportPhone", maskPhone(data.ddd_telefone_1));
      }
      
    } catch (err) {
      console.error(err);
      alert("Erro ao buscar CNPJ na base de dados.");
    } finally {
      setSearchingCNPJ(false);
    }
  };

  const handleCepSearch = async () => {
    const cep = form.getValues("zipCode")?.replace(/\D/g, "");
    if (!cep || cep.length !== 8) return;

    setSearchingCEP(true);
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`);
      if (!res.ok) throw new Error("CEP não encontrado");
      const data = await res.json();
      
      form.setValue("street", data.street || "");
      form.setValue("neighborhood", data.neighborhood || "");
      form.setValue("city", data.city || "");
      form.setValue("state", data.state || "");
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingCEP(false);
    }
  };

  if (loading) return <div className="p-8">Carregando...</div>;

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configurações Globais</h2>
        <p className="text-muted-foreground">Gerencie os dados, faturamento e configurações de uso da sua empresa.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados da Empresa e Responsável Legal</CardTitle>
              <CardDescription>
                Informações da sua empresa. Digite o CNPJ para buscar automaticamente na base da Receita.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="document"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input 
                            placeholder="00.000.000/0001-00" 
                            {...field} 
                            onChange={(e) => field.onChange(maskCNPJ(e.target.value))}
                            onBlur={() => {
                              field.onBlur();
                              if (field.value.replace(/\D/g, "").length === 14) {
                                handleCnpjSearch();
                              }
                            }}
                          />
                        </FormControl>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon" 
                          onClick={handleCnpjSearch}
                          disabled={searchingCNPJ}
                        >
                          {searchingCNPJ ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Razão Social</FormLabel>
                      <FormControl>
                        <Input placeholder="Razão Social" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tradeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Fantasia</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome Fantasia" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Domínio do Portal do Cliente</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <span className="bg-slate-100 border border-r-0 border-slate-300 rounded-l-md px-3 py-2 text-sm text-slate-500">
                            /portal/
                          </span>
                          <Input className="rounded-l-none" placeholder="sua-empresa" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 border-t pt-6">
                  <h4 className="md:col-span-2 text-sm font-semibold text-slate-900">Responsável Legal</h4>
                  <FormField
                    control={form.control}
                    name="legalRepName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Representante</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome Completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="legalRepCpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF do Representante</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="000.000.000-00" 
                            {...field} 
                            onChange={(e) => field.onChange(maskCPF(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Endereço</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input 
                              placeholder="00000-000" 
                              {...field} 
                              onChange={(e) => field.onChange(maskCEP(e.target.value))}
                              onBlur={() => {
                                field.onBlur();
                                if (field.value?.replace(/\D/g, "").length === 8) {
                                  handleCepSearch();
                                }
                              }}
                            />
                          </FormControl>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="icon" 
                            onClick={handleCepSearch}
                            disabled={searchingCEP}
                          >
                            {searchingCEP ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="md:col-span-4">
                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logradouro / Rua</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua exemplo..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número</FormLabel>
                        <FormControl>
                          <Input placeholder="123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="md:col-span-4">
                  <FormField
                    control={form.control}
                    name="complement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complemento</FormLabel>
                        <FormControl>
                          <Input placeholder="Sala 01, Andar 2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="neighborhood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro</FormLabel>
                        <FormControl>
                          <Input placeholder="Bairro" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="md:col-span-3">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input placeholder="Cidade" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="md:col-span-1">
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Input placeholder="UF" maxLength={2} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contato e Suporte</CardTitle>
              <CardDescription>
                Estes dados são exibidos no Portal do Cliente e utilizados em documentos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="supportEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail de Suporte</FormLabel>
                      <FormControl>
                        <Input placeholder="suporte@suaempresa.com.br" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="supportPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone / WhatsApp</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="(11) 99999-9999" 
                          {...field} 
                          onChange={(e) => field.onChange(maskPhone(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Faturamento e Cobrança</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="billingCutoffStrategy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estratégia de Data de Corte</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a estratégia" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="GLOBAL">Global (Única para a empresa)</SelectItem>
                          <SelectItem value="PER_CONTRACT">Por Contrato (Definida no contrato)</SelectItem>
                          <SelectItem value="PER_PRODUCT_GROUP">Por Produto / Grupo (Definida no produto)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Define em qual nível a data de corte será validada no momento do cancelamento do contrato.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("billingCutoffStrategy") === "GLOBAL" && (
                  <FormField
                    control={form.control}
                    name="globalCutoffDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dia de Corte Padrão</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" max="31" {...field} />
                        </FormControl>
                        <FormDescription>
                          Dia do mês em que o cliente deixa de pagar o próximo boleto pendente no cancelamento.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contratos e Documentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="allowActivationWithoutDocument"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Permitir ativação sem documento</FormLabel>
                        <FormDescription>
                          Permite mudar o status do contrato para Ativo mesmo sem um documento DOCX gerado vinculado a ele.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pb-12">
            <Button type="submit" size="lg">Salvar Configurações Globais</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
