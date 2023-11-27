"use server"
import prisma from "@/lib/prisma"
import { Role } from "@prisma/client"
import { Session } from "next-auth"
import { redirect } from "next/navigation"

export async function getUsers(){
    const users = await prisma.user.findMany({})
    return users
}

export async function getAdminUser(session: Session){
    const user = await prisma.user.findUnique({
        where: {
          id: session.user.id
        }
      })
    return user
}


export async function updateUserInfo(updatedData: {role: string; DCC: string;}, userId: string ) {
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
                throw new Error ('not a role type')
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