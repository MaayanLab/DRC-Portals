import prisma from "@/lib/prisma"
import DataTable from "./DataTable"
import { Container, Typography, Grid } from '@mui/material';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Nav from "../Nav";


async function getUserData() {
    const users = await prisma.user.findMany({})
    const rows = users.map((user, index) => {
        return { id: index + 1, name: user.name, email: user.email, dcc: user.dcc, role: user.role.toString() }
    });
    return { 'users': users, 'rows': rows }
}

export default async function UsersTable() {
    const session = await getServerSession(authOptions)
    if (!session) return redirect("/auth/signin?callbackUrl=/data/contribute/admin")
    const user = await prisma.user.findUnique({
        where: {
            id: session.user.id
        }
    })
    if (user === null) return redirect("/auth/signin?callbackUrl=/data/contribute/admin")

    if (!(user.role === 'ADMIN')) {
        return (
            <>
                <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid md={2} xs={12}>
                        <Nav />
                    </Grid>
                    <Grid md={10} xs={12}>
                        <p>Access Denied. This page is only accessible to Admin Users</p>
                    </Grid>
                </Grid>
            </>)
    }

    const allUserData = await getUserData();
    const rowData = allUserData['rows']
    const rawData = allUserData['users']
    const dccInfo = await prisma.dCC.findMany()
    const dccMapping: { [key: string]: string } = {}
    dccInfo.map((dcc) => {
        dcc.short_label ? dccMapping[dcc.short_label] = dcc.label : dccMapping[dcc.label] = dcc.label
        })
    return (
        <>
            <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid md={2} xs={12}>
                    <Nav />
                </Grid>
                <Grid md={10} xs={12}>
                    <Container className="justify-content-center" sx={{ minHeight: "30vw" }}>
                        <Typography variant="h3" color="secondary.dark" className='p-5'>ADMIN PAGE</Typography>
                        <DataTable rows={rowData} users={rawData} dccMapping={dccMapping} />
                    </Container>
                </Grid>
            </Grid>
        </>

    )
}