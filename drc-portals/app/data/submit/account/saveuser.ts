'use server'
import { keycloak_push } from "@/lib/auth/keycloak";
import prisma from "@/lib/prisma";
import { revalidatePath } from 'next/cache';

export async function saveuser(formData: FormData, userId: string) {
  const email = formData.get('email')
  const dcc = formData.get('DCC')
  const name  = formData.get('name')
  try{
    if (email) {
        const userInfo = await prisma.user.update({
            where: {
                id: userId,
            },
            select: {
                name: true,
                email: true,
                role: true,
                dccs: {
                    select: {
                        short_label: true,
                    }
                },
                accounts: {
                    where: {
                        provider: 'keycloak',
                    }
                },
            },
            data: {
                name: name?.toString(),
                email: email.toString(),
            },
        });
        if (userInfo.accounts.some(account => account.provider === 'keycloak')) await keycloak_push({ userInfo })
    } else {
        const userInfo = await prisma.user.update({
            where: {
                id: userId,
            },
            select: {
                name: true,
                email: true,
                role: true,
                dccs: {
                    select: {
                        short_label: true,
                    }
                },
                accounts: {
                    where: {
                        provider: 'keycloak',
                    }
                },
            },
            data: {
                name: name?.toString(),
            },
        })
        if (userInfo.accounts.some(account => account.provider === 'keycloak')) await keycloak_push({ userInfo })
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