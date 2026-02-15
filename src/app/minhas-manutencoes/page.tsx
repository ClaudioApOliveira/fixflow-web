'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

interface OrdemServico {
  id: number;
  codigoRastreio: string;
  status: string;
  valorTotal: number;
  modeloVeiculo: string;
  criadoEm: string;
}

interface Servico {
  id: number;
  tipoServico: string;
  descricao: string;
  valor: number;
  kmVeiculo: number;
  criadoEm: string;
}

export default function MinhasManutencoes() {
  const [selectedOS, setSelectedOS] = useState<number | null>(null);

  const { data: ordens } = useQuery({
    queryKey: ['minhas-ordens'],
    queryFn: async () => {
      const res = await api.get('/ordens-servico');
      return (res as any).data.data as OrdemServico[];
    },
  });

  const { data: servicos } = useQuery({
    queryKey: ['servicos-os', selectedOS],
    queryFn: async () => {
      if (!selectedOS) return [];
      const res = await api.get(`/servicos-os/ordem-servico/${selectedOS}`);
      return (res as any).data.data as Servico[];
    },
    enabled: !!selectedOS,
  });

  const gerarRelatorio = () => {
    if (!ordens) return;

    const content = `
RELATÓRIO DE MANUTENÇÕES
========================

Total de Ordens: ${ordens.length}
Valor Total: R$ ${ordens.reduce((acc, o) => acc + o.valorTotal, 0).toFixed(2)}

DETALHAMENTO:
${ordens.map(o => `
- OS #${o.id} | ${o.modeloVeiculo}
  Status: ${o.status}
  Valor: R$ ${o.valorTotal.toFixed(2)}
  Data: ${new Date(o.criadoEm).toLocaleDateString('pt-BR')}
`).join('\n')}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-manutencoes-${Date.now()}.txt`;
    a.click();
  };

  return (
    <DashboardLayout title="Minhas Manutenções" subtitle="Visualize seu histórico de manutenções">
      <div className="mb-6">
        <button
          onClick={gerarRelatorio}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Gerar Relatório
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Ordens de Serviço</h2>
          <div className="space-y-3">
            {ordens?.map((ordem) => (
              <div
                key={ordem.id}
                onClick={() => setSelectedOS(ordem.id)}
                className={`p-4 border rounded cursor-pointer hover:bg-gray-50 ${
                  selectedOS === ordem.id ? 'border-blue-500 bg-blue-50' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">OS #{ordem.id}</p>
                    <p className="text-sm text-gray-600">{ordem.modeloVeiculo}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(ordem.criadoEm).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        ordem.status === 'CONCLUIDO'
                          ? 'bg-green-100 text-green-800'
                          : ordem.status === 'EM_ANDAMENTO'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {ordem.status}
                    </span>
                    <p className="font-bold mt-1">R$ {ordem.valorTotal.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Serviços Realizados</h2>
          {selectedOS ? (
            <div className="space-y-3">
              {servicos?.map((servico) => (
                <div key={servico.id} className="p-3 border rounded">
                  <p className="font-semibold">{servico.tipoServico}</p>
                  <p className="text-sm text-gray-600">{servico.descricao}</p>
                  {servico.kmVeiculo && (
                    <p className="text-xs text-gray-500">KM: {servico.kmVeiculo}</p>
                  )}
                  <p className="font-bold text-blue-600 mt-2">
                    R$ {servico.valor.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Selecione uma ordem para ver os serviços
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
