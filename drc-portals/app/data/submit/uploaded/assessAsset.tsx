'use server'
import { authOptions } from '@/lib/auth';
import { queue_fairshake } from '@/tasks/fairshake';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export async function assessAsset({ link }: { link: string }) {
  const session = await getServerSession(authOptions)
  if (!session) return redirect("/auth/signin?callbackUrl=/data/submit/uploaded")
  if (!(session.user.role === 'ADMIN')) throw new Error('not an admin')
  await queue_fairshake({ link })
}
