'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { X } from 'lucide-react'

const SERIES = ['','Creche','1º','2º','3º','4º','5º','6º','7º','8º','9º','Ensino Médio']
const ORIGENS = ['Escola Municipal','Escola Estadual','Família','SAP','APAE','AMA OESTE','CAPSi','Psicologia Unoesc','Outro']

interface Props {
  onClose: () => void
  onSaved: () => void
  statusInicial?: string
}

export function CadastroCriancaModal({ onClose, onSaved, statusInicial = 'espera' }: Props) {
  const [form, setForm] = useState({
    nome: '', data_contato: new Date().toISOString().split('T')[0],
    origem: 'Escola Municipal', idade: '', serie: '', telefone: '',
    responsavel: '', estagiario: '', observacoes: '',
    status: statusInicial, status_contato: '', status_anamnese: 'nao_iniciado',
  })
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')

  function set(field: string, value: string) {
    setForm(f => {
      const updated = { ...f, [field]: value }
      // Auto-determinar status pela série
      if (field === 'serie' && (statusInicial === 'espera' || statusInicial === 'sem_serie' || statusInicial === 'transferir')) {
        const n = parseInt(value)
        if (!value) updated.status = 'sem_serie'
        else if (n >= 6) updated.status = 'transferir'
        else updated.status = 'espera'
      }
      return updated
    })
  }

  async function salvar() {
    if (!form.nome.trim()) { setErro('Nome é obrigatório'); return }
    setSaving(true)
    const { error } = await supabase.from('criancas').insert({
      ...form,
      idade: form.idade ? parseInt(form.idade) : null,
    })
    if (error) { setErro(error.message); setSaving(false); return }
    onSaved()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900" style={{fontFamily:'var(--font-display)'}}>Nova Criança</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Nome completo *
            </label>
            <input className="oba-input" value={form.nome}
              onChange={e => set('nome', e.target.value)} placeholder="Nome da criança" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Data do contato</label>
            <input type="date" className="oba-input" value={form.data_contato}
              onChange={e => set('data_contato', e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Origem</label>
            <select className="oba-input" value={form.origem} onChange={e => set('origem', e.target.value)}>
              {ORIGENS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Série</label>
            <select className="oba-input" value={form.serie} onChange={e => set('serie', e.target.value)}>
              {SERIES.map(s => <option key={s} value={s}>{s || '(não informada)'}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Idade</label>
            <input type="number" className="oba-input" value={form.idade}
              onChange={e => set('idade', e.target.value)} placeholder="Ex: 8" min={0} max={20} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Telefone</label>
            <input className="oba-input" value={form.telefone}
              onChange={e => set('telefone', e.target.value)} placeholder="(49) 99999-9999" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Responsável</label>
            <input className="oba-input" value={form.responsavel}
              onChange={e => set('responsavel', e.target.value)} placeholder="Nome do responsável" />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Estagiário responsável</label>
            <input className="oba-input" value={form.estagiario}
              onChange={e => set('estagiario', e.target.value)} placeholder="Nome do estagiário" />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Observações</label>
            <textarea className="oba-input resize-none" rows={3} value={form.observacoes}
              onChange={e => set('observacoes', e.target.value)}
              placeholder="Disponibilidade de horário, informações adicionais..." />
          </div>

          {/* Status automático */}
          <div className="col-span-2">
            <div className={`text-xs px-3 py-2 rounded-lg border ${
              form.status === 'espera' ? 'bg-blue-50 text-blue-700 border-blue-200' :
              form.status === 'transferir' ? 'bg-orange-50 text-orange-700 border-orange-200' :
              form.status === 'monitoria' ? 'bg-violet-50 text-violet-700 border-violet-200' :
              'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              <strong>Situação automática:</strong>{' '}
              {form.status === 'espera' ? '✅ Apta para avaliação (até 5ª série)' :
               form.status === 'transferir' ? '🔄 Será direcionada para Lista Monitoria (6ª série ou acima)' :
               form.status === 'monitoria' ? '🟣 Lista Monitoria' :
               '⚠️ Série não informada – verificar depois'}
            </div>
          </div>
        </div>

        {erro && (
          <div className="mx-6 mb-4 px-4 py-2.5 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {erro}
          </div>
        )}

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="btn-ghost">Cancelar</button>
          <button onClick={salvar} disabled={saving} className="btn-primary">
            {saving ? 'Salvando...' : 'Cadastrar criança'}
          </button>
        </div>
      </div>
    </div>
  )
}
