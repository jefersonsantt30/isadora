'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase, Crianca } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'
import { Calendar } from 'lucide-react'

const DIAS = ['SEGUNDA','TERÇA','QUARTA','QUINTA','SEXTA']
const HORARIOS_MANHA = ['08h00','09h00','10h00','11h00']
const HORARIOS_TARDE = ['13h30','14h30','15h30','16h30']
const HORARIOS_NOITE = ['17h30','18h00','18h30','19h30','20h30']
const TODOS_HORARIOS = [...HORARIOS_MANHA, ...HORARIOS_TARDE, ...HORARIOS_NOITE]

// Dados iniciais dos agendamentos 2026 (da planilha original)
const AGENDA_INICIAL: Record<string, Record<string, { estagiario: string; crianca: string; sala: string }>> = {
  'SEGUNDA-09h00': { sala: 'OBA R207B', estagiario: 'Luana da Silva Bittencourt', crianca: 'Jeremias de Jesus Planchart Bolivar' },
  'SEGUNDA-10h00': { sala: 'OBA R207B', estagiario: 'Luana da Silva Bittencourt', crianca: '' },
  'SEGUNDA-13h30': { sala: 'OBA R207B', estagiario: 'Jaqueline Vaz de Oliveira', crianca: 'Rayssa' },
  'SEGUNDA-14h30': { sala: 'OBA R207B', estagiario: 'Eliane Carmen Gasparini', crianca: '' },
  'SEGUNDA-16h30': { sala: 'OBA R207B', estagiario: 'Bruna Luiza Penz', crianca: '' },
  'SEGUNDA-17h30': { sala: 'OBA R207B', estagiario: 'Andreia', crianca: '' },
  'TERÇA-10h00':   { sala: 'OBA R207B', estagiario: 'Jaqueline Vaz de Oliveira', crianca: '' },
  'TERÇA-14h30':   { sala: 'OBA R207B', estagiario: 'Andreia Horbach', crianca: '' },
  'TERÇA-15h30':   { sala: 'OBA R207B', estagiario: 'Adersom Zorzi', crianca: '' },
  'TERÇA-16h30':   { sala: 'OBA R207B', estagiario: 'Mariana Monti', crianca: '' },
  'TERÇA-17h30':   { sala: 'OBA R207B', estagiario: 'Maria Laura de Martini Sartori', crianca: '' },
  'TERÇA-16h30-SAP': { sala: 'SAP 113', estagiario: 'Letícia Variani', crianca: '' },
  'QUARTA-09h00':  { sala: 'OBA R207B', estagiario: 'Kelly de Carli', crianca: '' },
  'QUARTA-11h00':  { sala: 'OBA R207B', estagiario: 'Taylor Boeno Pinheiro', crianca: '' },
  'QUARTA-15h30':  { sala: 'OBA R207B', estagiario: 'Maria Laura de Martini Sartori', crianca: '' },
  'QUARTA-17h30':  { sala: 'OBA R207B', estagiario: 'Bruna Luiza Penz', crianca: '' },
  'QUARTA-18h30':  { sala: 'OBA R207B', estagiario: 'Iago', crianca: '' },
  'QUARTA-19h30':  { sala: 'OBA R207B', estagiario: 'Fernanda Mantelli', crianca: '' },
  'QUINTA-08h00':  { sala: 'OBA R207B', estagiario: 'Lilian Marques', crianca: '' },
  'QUINTA-09h00':  { sala: 'OBA R207B', estagiario: 'Julceia Zanetti', crianca: '' },
  'QUINTA-10h00':  { sala: 'OBA R207B', estagiario: 'Lilian Marques', crianca: '' },
  'QUINTA-11h00':  { sala: 'OBA R207B', estagiario: 'Julceia Zanetti', crianca: '' },
  'QUINTA-13h30':  { sala: 'OBA R207B', estagiario: 'Guilherme', crianca: '' },
  'QUINTA-14h30':  { sala: 'OBA R207B', estagiario: 'Eduarda Simon', crianca: '' },
  'SEXTA-11h00':   { sala: 'OBA R207B', estagiario: 'Isadora Sartori', crianca: '' },
  'SEXTA-13h30':   { sala: 'OBA R207B', estagiario: 'Prof. Francine', crianca: 'Supervisão' },
  'SEXTA-14h30':   { sala: 'OBA R207B', estagiario: 'Prof. Francine', crianca: 'Supervisão' },
  'SEXTA-15h30':   { sala: 'OBA R207B', estagiario: 'Prof. Francine', crianca: 'Supervisão' },
  'SEXTA-16h30':   { sala: 'OBA R207B', estagiario: 'Prof. Francine', crianca: 'Supervisão' },
  'SEXTA-17h30-SAP': { sala: 'SAP 113', estagiario: 'Andreia', crianca: '' },
}

const DIA_COLORS: Record<string, string> = {
  SEGUNDA: 'bg-blue-600',
  TERÇA:   'bg-emerald-600',
  QUARTA:  'bg-orange-500',
  QUINTA:  'bg-violet-600',
  SEXTA:   'bg-red-500',
}

export default function Agendamentos() {
  const [diaSelecionado, setDiaSelecionado] = useState('SEGUNDA')
  const [agenda, setAgenda] = useState(AGENDA_INICIAL)
  const [editando, setEditando] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ estagiario: '', crianca: '', sala: 'OBA R207B' })

  const horariosOBA = TODOS_HORARIOS
  const horariosSAP = ['13h30','14h30','15h30','16h30','17h30','18h30','19h30','20h30']
    .filter(h => diaSelecionado !== 'QUARTA')

  function getSlot(dia: string, hora: string, local = '') {
    const key = local ? `${dia}-${hora}-${local}` : `${dia}-${hora}`
    return agenda[key]
  }

  function salvarSlot(key: string) {
    setAgenda(prev => ({ ...prev, [key]: { ...editForm } }))
    setEditando(null)
  }

  const SlotRow = ({ hora, local = '' }: { hora: string, local?: string }) => {
    const key = local ? `${diaSelecionado}-${hora}-${local}` : `${diaSelecionado}-${hora}`
    const slot = agenda[key]
    const isEditing = editando === key

    return (
      <tr className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${slot ? '' : 'opacity-60'}`}>
        <td className="px-4 py-2.5 text-xs font-mono font-semibold text-gray-500 w-16">{hora}</td>
        <td className="px-4 py-2.5 text-xs text-gray-400 w-24">{local || 'OBA R207B'}</td>
        {isEditing ? (
          <>
            <td className="px-2 py-2"><input className="oba-input text-xs py-1.5" value={editForm.estagiario}
              onChange={e => setEditForm(f=>({...f,estagiario:e.target.value}))} placeholder="Estagiário"/></td>
            <td className="px-2 py-2"><input className="oba-input text-xs py-1.5" value={editForm.crianca}
              onChange={e => setEditForm(f=>({...f,crianca:e.target.value}))} placeholder="Criança"/></td>
            <td className="px-2 py-2 w-24">
              <div className="flex gap-1">
                <button onClick={() => salvarSlot(key)} className="btn-primary text-xs py-1 px-2">✓</button>
                <button onClick={() => setEditando(null)} className="btn-ghost text-xs py-1 px-2">✕</button>
              </div>
            </td>
          </>
        ) : (
          <>
            <td className="px-4 py-2.5 text-sm">
              {slot?.estagiario
                ? <span className="font-medium text-gray-800">{slot.estagiario}</span>
                : <span className="text-gray-300 text-xs">—</span>}
            </td>
            <td className="px-4 py-2.5 text-sm">
              {slot?.crianca
                ? <span className="text-blue-700 font-medium">{slot.crianca}</span>
                : <span className="text-gray-200 text-xs">Disponível</span>}
            </td>
            <td className="px-4 py-2.5 w-16">
              <button onClick={() => {
                setEditando(key)
                setEditForm({ estagiario: slot?.estagiario||'', crianca: slot?.crianca||'', sala: slot?.sala||'OBA R207B' })
              }} className="text-xs text-gray-300 hover:text-brand-600 transition-colors">editar</button>
            </td>
          </>
        )}
      </tr>
    )
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="main-content p-8">
        <div className="mb-6 fade-up">
          <h1 className="text-2xl font-bold text-gray-900" style={{fontFamily:'var(--font-display)'}}>Agendamentos 2026</h1>
          <p className="text-gray-500 text-sm mt-1">Horários de atendimento por dia da semana</p>
        </div>

        {/* Seletor de dia */}
        <div className="flex gap-2 mb-6 fade-up fade-up-1">
          {DIAS.map(dia => (
            <button key={dia} onClick={() => setDiaSelecionado(dia)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                diaSelecionado === dia
                  ? `${DIA_COLORS[dia]} text-white shadow-sm`
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}>
              {dia}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Sala OBA */}
          <div className="card overflow-hidden fade-up fade-up-2">
            <div className={`px-4 py-3 ${DIA_COLORS[diaSelecionado]} flex items-center gap-2`}>
              <Calendar size={15} className="text-white" />
              <h2 className="text-white font-semibold text-sm">{diaSelecionado} · Sala OBA (R207B)</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {['Hora','Local','Estagiário','Criança',''].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {horariosOBA.map(h => <SlotRow key={h} hora={h} />)}
              </tbody>
            </table>
          </div>

          {/* Sala SAP */}
          {(diaSelecionado === 'SEGUNDA' || diaSelecionado === 'TERÇA' || diaSelecionado === 'SEXTA') && (
            <div className="card overflow-hidden fade-up fade-up-3">
              <div className={`px-4 py-3 bg-gray-700 flex items-center gap-2`}>
                <Calendar size={15} className="text-white" />
                <h2 className="text-white font-semibold text-sm">{diaSelecionado} · SAP (Sala 113)</h2>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    {['Hora','Local','Estagiário','Criança',''].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {horariosSAP.map(h => <SlotRow key={`${h}-SAP`} hora={h} local="SAP" />)}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
