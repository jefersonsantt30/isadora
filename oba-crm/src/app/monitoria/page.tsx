import { ListaPage } from '@/components/ListaPage'

export default function Monitoria() {
  return (
    <ListaPage
      titulo="Lista Monitoria"
      subtitulo="crianças na monitoria"
      statuses={['monitoria']}
      headerColor="bg-violet-600"
      showCadastro
    />
  )
}
