import { ListaPage } from '@/components/ListaPage'

export default function Concluidas() {
  return (
    <ListaPage
      titulo="Avaliações Concluídas"
      subtitulo="avaliações concluídas"
      statuses={['concluida']}
      headerColor="bg-emerald-600"
    />
  )
}
