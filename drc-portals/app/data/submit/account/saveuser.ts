import prisma from "@/lib/prisma";
import { revalidatePath } from 'next/cache';

export async function saveuser(formData: FormData, userId: string) {
  const email = formData.get('email')
  const dcc = formData.get('DCC')
  const name  = formData.get('name')
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
}