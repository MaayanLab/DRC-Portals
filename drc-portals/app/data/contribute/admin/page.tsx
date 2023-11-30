import prisma from "@/lib/prisma"
import DataTable from "./DataTable"
import {Container, Typography } from '@mui/material';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';


async function getUserData() {
    const users = await prisma.user.findMany({})
    const rows = users.map((user, index) => {
        return { id: index + 1, name: user.name, email: user.email, dcc: user.dcc, role: user.role.toString() }
    });
    return {'users': users, 'rows': rows}
}

export default async function UsersTable() {
    const session = await getServerSession(authOptions)
    if (!session) return redirect("/auth/signin?callbackUrl=/data/contribute/form")
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id
      }
    })
    if (user === null ) return redirect("/auth/signin?callbackUrl=/data/contribute/form")
  
    if (!(user.role === 'ADMIN')) {
        return (<p>Access Denied. This page is only accessible to Admin Users</p>)}

    const allUserData = await getUserData();
    const rowData = allUserData['rows']
    const rawData = allUserData['users']
    return (
        <Container className="mt-10 justify-content-center" sx={{ mb: 5 }}>
        <Typography variant="h3" className='text-center p-5'>Users</Typography>
        <DataTable rows={rowData}  users={rawData}/>
        </Container>
    )
}