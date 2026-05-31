'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, Plus, Percent } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { IMaskInput } from 'react-imask';

export default function AdjustmentsPage() {
  const queryClient = useQueryClient();
  const [isIndexOpen, setIsIndexOpen] = useState(false);
  const [isRateOpen, setIsRateOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<string>('');

  const { data: indexes, isLoading } = useQuery({
    queryKey: ['adjustments-indexes'],
    queryFn: () => apiFetch('/adjustments/indexes'),
  });

  const createIndexMutation = useMutation({
    mutationFn: (data: any) => apiFetch('/adjustments/indexes', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adjustments-indexes'] });
      setIsIndexOpen(false);
    }
  });

  const addRateMutation = useMutation({
    mutationFn: (data: any) => apiFetch('/adjustments/rates', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adjustments-indexes'] });
      setIsRateOpen(false);
    }
  });

  const handleCreateIndex = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createIndexMutation.mutate({
      name: formData.get('name'),
      description: formData.get('description'),
    });
  };

  const [competenceVal, setCompetenceVal] = useState('');
  const [accumulatedRateVal, setAccumulatedRateVal] = useState('');

  const handleAddRate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!competenceVal || !accumulatedRateVal) return;
    addRateMutation.mutate({
      indexId: selectedIndex,
      competence: competenceVal,
      accumulatedRate: Number(accumulatedRateVal),
    });
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Carregando índices...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-primary w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">Reajustes</h1>
            <p className="text-muted-foreground">Gestão de Índices Econômicos (IGPM, IPCA).</p>
          </div>
        </div>
        
        <Dialog open={isIndexOpen} onOpenChange={setIsIndexOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/30">
              <Plus size={16} className="mr-2" /> Novo Índice
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Criar Índice Econômico</DialogTitle></DialogHeader>
            <form onSubmit={handleCreateIndex} className="space-y-4">
              <div>
                <label className="text-sm font-semibold">Nome (Ex: IGPM, IPCA)</label>
                <input name="name" required className="w-full border p-2 rounded mt-1" />
              </div>
              <div>
                <label className="text-sm font-semibold">Descrição</label>
                <input name="description" className="w-full border p-2 rounded mt-1" />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createIndexMutation.isPending}>Salvar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {indexes?.map((index: any) => (
          <div key={index.id} className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{index.name}</h3>
                <p className="text-sm text-muted-foreground">{index.description}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => { setSelectedIndex(index.id); setIsRateOpen(true); }}>
                <Percent size={14} className="mr-1" /> Add Taxa
              </Button>
            </div>
            
            {index.rates && index.rates.length > 0 ? (
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Competência</TableHead>
                    <TableHead className="text-right">Acumulado (12m)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {index.rates.map((rate: any) => (
                    <TableRow key={rate.id}>
                      <TableCell className="font-medium">{rate.competence}</TableCell>
                      <TableCell className="text-right text-primary font-bold">{Number(rate.accumulatedRate).toFixed(2)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-sm text-slate-500 py-4 text-center">Nenhuma taxa cadastrada.</div>
            )}
          </div>
        ))}
        {indexes?.length === 0 && <div className="col-span-full p-8 text-center text-slate-500">Nenhum índice cadastrado.</div>}
      </div>

      {/* Modal Add Rate */}
      <Dialog open={isRateOpen} onOpenChange={setIsRateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cadastrar Taxa Acumulada</DialogTitle></DialogHeader>
          <form onSubmit={handleAddRate} className="space-y-4">
            <div>
              <label className="text-sm font-semibold">Competência (YYYY-MM)</label>
              <IMaskInput
                mask="0000-00"
                placeholder="Ex: 2024-05"
                required
                value={competenceVal}
                onAccept={(val) => setCompetenceVal(val)}
                className="w-full border p-2 rounded mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Taxa Acumulada (%)</label>
              <IMaskInput
                mask={Number}
                scale={2}
                padFractionalZeros={true}
                normalizeZeros={true}
                radix=","
                mapToRadix={['.']}
                unmask={'typed'}
                required
                value={String(accumulatedRateVal)}
                onAccept={(val) => setAccumulatedRateVal(String(val))}
                className="w-full border p-2 rounded mt-1"
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={addRateMutation.isPending}>Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
