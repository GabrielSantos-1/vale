import ContratarClient from './contratar-client'

type Props = {
  searchParams: Promise<{
    plano?: string
  }>
}

export default async function ContratarPage({ searchParams }: Props) {
  const params = await searchParams

  return <ContratarClient plano={params.plano || ''} />
}