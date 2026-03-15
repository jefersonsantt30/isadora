import { ListaPage } from '@/components/ListaPage'

export default function Desligadas() {
  return (
    <ListaPage
      titulo="Desligadas / Desistentes"
      subtitulo="registros desligados"
      statuses={['desligada']}
      headerColor="bg-red-600"
    />
  )
}
