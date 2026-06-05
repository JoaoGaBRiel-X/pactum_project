"use client";

import { useEffect, useState, useRef } from "react";
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
import { tenantSettingsApi } from "@/services/tenant-settings-api";
import { getImageUrl } from "@/lib/utils";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";

const visualIdentitySchema = z.object({
  primaryColor: z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, "Cor inválida").optional(),
  secondaryColor: z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, "Cor inválida").optional().or(z.literal("")),
  sidebarColor: z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, "Cor inválida").optional().or(z.literal("")),
  sidebarTextColor: z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, "Cor inválida").optional().or(z.literal("")),
});

type VisualIdentityFormValues = z.infer<typeof visualIdentitySchema>;

export default function VisualIdentitySettingsPage() {
  const [loading, setLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<VisualIdentityFormValues>({
    resolver: zodResolver(visualIdentitySchema),
    defaultValues: {
      primaryColor: "#1E40AF",
      secondaryColor: "",
      sidebarColor: "#0f172a",
      sidebarTextColor: "#ffffff",
    },
  });

  useEffect(() => {
    async function load() {
      try {
        const data = await tenantSettingsApi.getSettings();
        setLogoUrl(data.logoUrl || "");
        form.reset({
          primaryColor: data.primaryColor || "#1E40AF",
          secondaryColor: data.secondaryColor || "",
          sidebarColor: data.sidebarColor || "#0f172a",
          sidebarTextColor: data.sidebarTextColor || "#ffffff",
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [form]);

  async function onSubmit(data: VisualIdentityFormValues) {
    try {
      await tenantSettingsApi.updateSettings(data);
      toast.success("Configurações de cores salvas com sucesso!");
      setTimeout(() => window.location.reload(), 1500); 
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar as configurações");
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const updatedSettings = await tenantSettingsApi.uploadLogo(file);
      if (updatedSettings.logoUrl) {
        setLogoUrl(updatedSettings.logoUrl);
        alert("Logotipo atualizado com sucesso!");
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar logotipo.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) return <div className="p-8">Carregando...</div>;

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Identidade Visual</h2>
        <p className="text-muted-foreground">Personalize as cores do seu ambiente e o logotipo exibido no menu e nos documentos.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Logotipo da Empresa</CardTitle>
          <CardDescription>
            Faça upload da imagem do seu logotipo (recomendado PNG ou SVG com fundo transparente).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 w-full max-w-md">
              <div 
                className="border-2 border-dashed border-slate-300 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud className="h-10 w-10 text-slate-400 mb-4" />
                <p className="text-sm font-medium text-slate-700">Clique para selecionar um arquivo</p>
                <p className="text-xs text-slate-500 mt-1">PNG, JPG ou SVG (Máx. 2MB)</p>
                <input 
                  type="file" 
                  className="hidden" 
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/svg+xml"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                />
              </div>
              {uploading && <p className="text-sm text-blue-600 mt-2">Enviando imagem...</p>}
            </div>

            {logoUrl && (
              <div className="flex-1">
                <p className="text-sm font-medium mb-2">Visualização Atual:</p>
                <div className="p-6 border rounded-md bg-slate-50 flex justify-center items-center h-40">
                  <img src={getImageUrl(logoUrl)} alt="Logo atual" className="max-h-full max-w-full object-contain" />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cores do Sistema</CardTitle>
          <CardDescription>
            A cor primária será aplicada em botões, links e destaques da plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, (errs) => {
              toast.error("Por favor, verifique os campos com erro.");
            })} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                  <FormField
                    control={form.control}
                    name="sidebarColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cor de Fundo do Menu Lateral (Hex)</FormLabel>
                        <div className="flex gap-4 items-center">
                          <FormControl>
                            <Input type="color" className="w-16 h-10 p-1 cursor-pointer" {...field} />
                          </FormControl>
                          <FormControl>
                            <Input className="flex-1" placeholder="#0f172a" {...field} />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sidebarTextColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cor do Texto do Menu Lateral (Hex)</FormLabel>
                        <div className="flex gap-4 items-center">
                          <FormControl>
                            <Input type="color" className="w-16 h-10 p-1 cursor-pointer" {...field} />
                          </FormControl>
                          <FormControl>
                            <Input className="flex-1" placeholder="#ffffff" {...field} />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              
              <div className="flex justify-end gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    if (window.confirm("Deseja restaurar as cores para o padrão original? Você precisará clicar em Salvar para confirmar.")) {
                      form.setValue("primaryColor", "#1E40AF");
                      form.setValue("secondaryColor", "");
                      form.setValue("sidebarColor", "#0f172a");
                      form.setValue("sidebarTextColor", "#ffffff");
                    }
                  }}
                >
                  Restaurar Padrões
                </Button>
                <Button type="submit">Salvar Cores</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
