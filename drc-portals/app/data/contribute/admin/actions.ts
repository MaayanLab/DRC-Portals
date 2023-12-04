"use server"
import prisma from "@/lib/prisma"
import { Role } from "@prisma/client"
import { revalidatePath } from "next/cache";
import { UserInfo, updateForm } from "./DataTable";
import type { User } from '@prisma/client'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

async function verifyUser() {
    const session = await getServerSession(authOptions)
    if (!session) return redirect("/auth/signin?callbackUrl=/data/contribute/form")

    const user = await prisma.user.findUnique({
        where: {
            id: session.user.id
        }
    })
    if (user === null) throw new Error('No user found')
    if (user.role != 'ADMIN') throw new Error('not an admin')
}

export async function createOneUser(newUserData: {
    name: string;
    email: string;
    role: string;
    DCC: string;
}) {
    await verifyUser();

    let prismaRole = ''
    if (newUserData.role === "User") {
        prismaRole = Role.USER
    } else if (newUserData.role === "Uploader") {
        prismaRole = Role.UPLOADER
    }
    else if (newUserData.role === "DCC Approver") {
        prismaRole = Role.DCC_APPROVER
    }
    else if (newUserData.role === "DRC Approver") {
        prismaRole = Role.DRC_APPROVER
    }
    else if (newUserData.role === "Admin") {
        prismaRole = Role.ADMIN
    } else {
        throw new Error('not a role type')
    }

    await prisma.user.upsert({
        where: {
            email: newUserData.email,
        },
        update: {
            name: newUserData.name,
            dcc: newUserData.DCC.toString(),
            role: prismaRole as Role
        },
        create: {
            name: newUserData.name,
            email: newUserData.email,
            dcc: newUserData.DCC.toString(),
            role: prismaRole as Role
        },
    })
    revalidatePath('/')
}

export async function updateUserInfo(updatedForms: updateForm[], users: User[]) {
    await verifyUser();

    updatedForms.forEach(async (updatedData) => {
        let prismaRole = ''
        if (updatedData.role === "User") {
            prismaRole = Role.USER
        } else if (updatedData.role === "Uploader") {
            prismaRole = Role.UPLOADER
        }
        else if (updatedData.role === "DCC Approver") {
            prismaRole = Role.DCC_APPROVER
        }
        else if (updatedData.role === "DRC Approver") {
            prismaRole = Role.DRC_APPROVER
        }
        else if (updatedData.role === "Admin") {
            prismaRole = Role.ADMIN
        }

        // add dcc to user in db
        await prisma.user.update({
            where: {
                id: users[updatedData.index]['id']
            },
            data: {
                ...(updatedData.role.toString() != '' ? {
                    role: prismaRole as Role,
                } : {}),
                ...(updatedData.DCC?.toString() != '' ? {
                    dcc: updatedData.DCC?.toString()
                } : {})

            },
        });

    })
    revalidatePath('/')
}

export async function deleteUsers(usersToDel: UserInfo[], users: User[]) {
    await verifyUser();

    usersToDel.forEach(async (user, index) => {
        const deleteUser = await prisma.user.delete({
            where: {
                id: users[user.id - 1].id,
            },
        })

    })
    revalidatePath('/')

}