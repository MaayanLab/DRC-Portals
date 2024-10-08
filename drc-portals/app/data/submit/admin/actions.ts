"use server"
import prisma from "@/lib/prisma"
import { Role } from "@prisma/client"
import { revalidatePath } from "next/cache";
import { UserInfo, updateForm } from "./DataTable";
import type { User } from '@prisma/client'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { keycloak_push } from "@/lib/auth/keycloak";

async function verifyUser() {
    const session = await getServerSession(authOptions)
    if (!session) return redirect("/auth/signin?callbackUrl=/data/submit/form")
    if (session.user.role !== 'ADMIN') throw new Error('not an admin')
}

async function getDCCObjects(dccShortLabels: string[]) {
    let dccObjects = []
    for (let dcc of dccShortLabels) {
        let dccObject = await prisma.dCC.findFirst({
            where: {
                short_label: dcc
            }
        })
        if (dccObject) {
            dccObjects.push(dccObject)
        }
    }
    return dccObjects
}


export async function createOneUser(newUserData: {
    name: string;
    email: string;
    role: string;
    DCC: string[];
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
    } 
    else if (newUserData.role === "Read-Only") {
        prismaRole = Role.READONLY
    } 
    else {
        throw new Error('not a role type')
    }

    // get the DCC objects from form dccString
    const newDCCObjects = await getDCCObjects(newUserData.DCC)
    const newDCCObjectsIDs = newDCCObjects.map((dccObject) => {return ({id: dccObject.id})})

    // connect user to the new DCCs
    const userInfo = await prisma.user.create({
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
                select: {
                    providerAccountId: true,
                },
                where: {
                    provider: 'keycloak',
                }
            },
        },
        data:{
            name: newUserData.name,
            email: newUserData.email,
            dccs: {
                connect: newDCCObjectsIDs
            },
            role: prismaRole as Role
        }
    })
    if (userInfo.accounts.length > 0) await keycloak_push({ userInfo })

    revalidatePath('/')
}

export async function updateUserInfo(updatedForms: updateForm[], users: User[]) {
    await verifyUser();

    await Promise.all(updatedForms.map(async (updatedData) => {
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
        } else if (updatedData.role === "Read-Only") {
            prismaRole = Role.READONLY
        } 

        // add dcc to user in db
        // get the DCC objects from form dccString
        const newDCCObjects = await getDCCObjects(updatedData.DCC.split(','))
        const newDCCObjectsIDs = newDCCObjects.map((dccObject) => {return ({id: dccObject.id})})

        const [disconnected, updatedUser] = await prisma.$transaction([
            //disconnect old dccs from use
            prisma.user.update({
                where: {
                    id: users[updatedData.index]['id']
                },
                data: {
                    dccs: {
                        set: []
                    }
                },
            }), 
            // connect user to the new DCCs
            prisma.user.update({
                where: {
                    id: users[updatedData.index]['id']
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
                        select: {
                            providerAccountId: true,
                        },
                        where: {
                            provider: 'keycloak',
                        }
                    },
                },
                data: {
                    ...(updatedData.role.toString() != '' ? {
                        role: prismaRole as Role,
                    } : {}),
                    ...(updatedData.DCC?.toString() != '' ? {
                        dccs: {
                            connect: newDCCObjectsIDs
                        }
                    } : {})
                },
            })
        ])
        if (updatedUser.accounts.length > 0) await keycloak_push({ userInfo: updatedUser })
    }))
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