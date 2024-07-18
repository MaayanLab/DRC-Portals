'use server'
import prisma from "@/lib/prisma";
import { revalidatePath } from 'next/cache';

export async function saveuser(formData: FormData, userId: string) {
  const email = formData.get('email')
  const dcc = formData.get('DCC')
  const name  = formData.get('name')
  try{
    if (email) {
        await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                name: name?.toString(),
                email: email.toString(),
            },
        });
    } else {
        await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                name: name?.toString(),
            },
        });
    }
    revalidatePath('/')
    return {success: 'Success'}
  } catch (err: any) {
    if (err.message.includes('Unique constraint failed on the fields: (`email`)')) {
        return {error: 'Email already registered in portal on another account'}
    } else {
        return {error: 'Problem updating information'}
    }
  }

}