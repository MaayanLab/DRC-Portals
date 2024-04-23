import prisma from "@/lib/prisma"
// import DataTable from "./DataTable"
import { Container, Typography, Grid } from '@mui/material';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Nav from "../Nav";
import DataTable from "./DataTable";
import React from "react";


export default async function UsersTable() {
    const session = await getServerSession(authOptions)
    if (!session) return redirect("/auth/signin?callbackUrl=/data/submit/admin")
    const user = await prisma.user.findUnique({
        where: {
            id: session.user.id
        }
    })
    if (user === null) return redirect("/auth/signin?callbackUrl=/data/submit/admin")

    if (!(user.role === 'ADMIN')) {
        return (
            <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid md={2} xs={12}>
                    <Nav />
                </Grid>
                <Grid md={10} xs={12}>
                    <p>Access Denied. This page is only accessible to Admin Users</p>
                </Grid>
            </Grid>
        )
    }

    const users = await prisma.user.findMany({
        include: {
            dccs: true
        }
    })

    const rows = users.map((user, index) => {
        return { id: index + 1, name: user.name, email: user.email, role: user.role.toString(), dccs: user.dccs }
    });

    const dccInfo = await prisma.dCC.findMany()
    const dccMapping: { [key: string]: string } = {}
    dccInfo.map((dcc) => {
        dcc.short_label ? dccMapping[dcc.short_label] = dcc.label : dccMapping[dcc.label] = dcc.label
    })

    return (
        <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item container md={2} xs={12}>
                <Nav />
            </Grid>
            <Grid item container md={10} xs={12}>
                <Container className="justify-content-center" sx={{ minHeight: "30vw" }}>
                    <Typography variant="h3" color="secondary.dark" className='p-5'>ADMIN PAGE</Typography>
                    <DataTable rows={rows} users={users} dccMapping={dccMapping} />
                </Container>
            </Grid>
        </Grid>
    )
}