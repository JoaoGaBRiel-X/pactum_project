"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { tenantSettingsApi, TenantSettings } from "@/services/tenant-settings-api";

const settingsSchema = z.object({
  logoUrl: z.string().optional(),
  primaryColor: z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, "Cor inválida").optional(),
  secondaryColor: z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, "Cor inválida").optional().or(z.literal("")),
  supportEmail: z.string().email("E-mail inválido").optional().or(z.literal("")),
  supportPhone: z.string().optional(),
  companyDocument: z.string().optional(),
  name: z.string().min(3, "Razão social é obrigatória"),
  tradeName: z.string().optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Domínio deve conter apenas letras minúsculas, números e hifens").optional().or(z.literal("")),
  document: z.string().min(11, "Documento inválido"),
  legalRepName: z.string().optional(),
  legalRepCpf: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function GeneralSettingsPage() {
  const [loading, setLoading] = useState(true);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      primaryColor: "#1E40AF",
      logoUrl: "",
      secondaryColor: "",
      supportEmail: "",
      supportPhone: "",
      companyDocument: "",
      name: "",
      tradeName: "",
      slug: "",
      document: "",
      legalRepName: "",
      legalRepCpf: "",
    },
  });

  useEffect(() => {
    async function load() {
      try {
        const data = await tenantSettingsApi.getSettings();
        form.reset({
          logoUrl: data.logoUrl || "",
          primaryColor: data.primaryColor || "#1E40AF",
          secondaryColor: data.secondaryColor || "",
          supportEmail: data.supportEmail || "",
          supportPhone: data.supportPhone || "",
          companyDocument: data.companyDocument || "",
          name: data.name || "",
          tradeName: data.tradeName || "",
          slug: (data as any).slug || "",
          document: data.document || "",
          legalRepName: data.legalRepName || "",
          legalRepCpf: data.legalRepCpf || "",
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
      window.location.reload(); 
    } catch (err) {
      alert("Erro ao salvar as configurações");
    }
  }

  if (loading) return <div className="p-8">Carregando...</div>;

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configurações Globais</h2>
        <p className="text-muted-foreground">Gerencie a identidade visual e os dados da sua empresa.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Identidade Visual</CardTitle>
          <CardDescription>
            Personalize as cores do seu ambiente e a logo exibida no menu e em documentos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL da Logo (PNG ou SVG)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormDescription>Recomendado proporção 3:1 ou quadrada.</FormDescription>
                      <FormMessage />
                      {field.value && (
                        <div className="mt-4 p-4 border rounded-md bg-slate-50 flex justify-center">
                          <img src={field.value} alt="Logo preview" className="max-h-16 object-contain" />
                        </div>
                      )}
                    </FormItem>
                  )}
                />

                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="primaryColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cor Primária (Hex)</FormLabel>
                        <div className="flex gap-4 items-center">
                          <FormControl>
                            <Input type="color" className="w-16 h-10 p-1 cursor-pointer" {...field} />
                          </FormControl>
                          <FormControl>
                            <Input className="flex-1" placeholder="#1E40AF" {...field} />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="secondaryColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cor Secundária (Hex)</FormLabel>
                        <div className="flex gap-4 items-center">
                          <FormControl>
                            <Input type="color" className="w-16 h-10 p-1 cursor-pointer" {...field} />
                          </FormControl>
                          <FormControl>
                            <Input className="flex-1" placeholder="#F8FAFC" {...field} />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-medium mb-4">Dados da Empresa e Responsável Legal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <FormLabel>Domínio do Portal (Ex: minha-empresa)</FormLabel>
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
                  <FormField
                    control={form.control}
                    name="document"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CNPJ / CPF Oficial</FormLabel>
                        <FormControl>
                          <Input placeholder="00.000.000/0001-00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="legalRepName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Representante Legal</FormLabel>
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
                        <FormLabel>CPF do Representante Legal</FormLabel>
                        <FormControl>
                          <Input placeholder="000.000.000-00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-medium mb-4">Contato / Suporte</h3>
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
                          <Input placeholder="(11) 99999-9999" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit">Salvar Configurações</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
