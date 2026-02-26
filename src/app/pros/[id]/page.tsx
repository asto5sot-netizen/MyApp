import { redirect } from 'next/navigation'

export default async function ProPageLegacy({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/pro/${id}`)
}
