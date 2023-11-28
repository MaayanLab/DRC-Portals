"use server"
import prisma from "@/lib/prisma"
import { Role } from "@prisma/client"
import { Session } from "next-auth"


interface UserInfo {
    id: number;
    name: string | null;
    email: string | null;
    dcc: string | null;
    role: string | null;
}


export async function getUsers() {
    const users = await prisma.user.findMany({})
    return users
}

export async function getAdminUser(session: Session) {
    const user = await prisma.user.findUnique({
        where: {
            id: session.user.id
        }
    })
    return user
}


export async function updateUserInfo(updatedData: { role: string; DCC: string; }, userId: string) {
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
    } else {
        throw new Error('not a role type')
    }

    // add dcc to user in db
    await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            role: prismaRole as Role,
            ...(updatedData.DCC?.toString() != '' ? {
                dcc: updatedData.DCC?.toString()
            } : {})

        },
    });

}

export async function createOneUser(newUserData: {
    name: string;
    email: string;
    role: string;
    DCC: string;
}) {
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
}

export async function deleteUsers(usersToDel: UserInfo[], users: {
    id: string;
    name: string | null;
    email: string | null;
    emailVerified: Date | null;
    image: string | null;
    dcc: string | null;
    role: string;
}[]){
    usersToDel.forEach(async (user, index)=> {
        const deleteUser = await prisma.user.delete({
            where: {
              id: users[user.id - 1].id,
            },
          })
    })
    
}