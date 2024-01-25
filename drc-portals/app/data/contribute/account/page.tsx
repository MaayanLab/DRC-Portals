import React from 'react'
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Container from '@mui/material/Container'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { getServerSession } from "next-auth";
import MultiSelect from './MultiSelect';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const names = [
    'LINCS',
    '4DN',
    'A2CPS',
    'ExRNA',
    'GlyGen',
    'GTEx',
    'HMP',
    'HuBMAP',
    'IDG',
    'KidsFirst',
    'MoTrPAC',
    'Metabolomics',
    'SenNet',
    'SPARC'
];

export default async function AccountPage() {
    const session = await getServerSession(authOptions)
    if (!session) return redirect("/auth/signin?callbackUrl=/data/contribute/account")
    const user = await prisma.user.findUniqueOrThrow({
        where: {
            id: session.user.id,
        }
    })

    if (user === null) return redirect("/auth/signin?callbackUrl=/data/contribute/account")

    async function saveuser(formData: FormData) {
        'use server'
        const email = formData.get('email')
        const dcc = formData.get('DCC')
        if (email) {
            await prisma.user.update({
                where: {
                    id: session?.user.id,
                },
                data: {
                    email: email.toString(),
                },
            });
            revalidatePath('/data/contribute/account')
        }

    }


    return (
                <Container className="justify-content-center">
                    <Typography variant="h3" color="secondary.dark" className='p-5'>ACCOUNT INFORMATION</Typography>
                    <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
                        Please complete account email information before approving or the uploading forms. If the email field is empty, this information can only be saved once. For all other information updates to your user account (role or DCC), please contact the DRC to update your information.
                    </Typography>
                    <Box
                        component="form"
                        noValidate
                        autoComplete="off"
                        sx={{ display: 'grid', gridTemplateRows: 'repeat(3, 1fr)', '& > :not(style)': { m: 1, width: '50ch' } }}
                        justifyContent='center'
                        action={saveuser}
                    >
                        <TextField
                            disabled
                            id="input-name"
                            label="Name"
                            name='name'
                            defaultValue={user.name}
                            inputProps={{ style: { fontSize: 16 } }}
                            InputLabelProps={{ style: { fontSize: 16 } }}
                        />
                        <TextField
                            id="input-email"
                            label="Email"
                            name='email'
                            defaultValue={user.email}
                            inputProps={{ style: { fontSize: 16 } }}
                            InputLabelProps={{ style: { fontSize: 16 } }}
                            disabled={user.email ? true : false}
                            required
                        />
                        <MultiSelect
                            name='DCC'
                            label="DCC"
                            options={names}
                            defaultValue={user.dcc?.split(',')}
                        />
                        <TextField
                            id="input-role"
                            label="Role"
                            name='role'
                            defaultValue={user.role}
                            inputProps={{ style: { fontSize: 16 } }}
                            InputLabelProps={{ style: { fontSize: 16 } }}
                            disabled
                        />

                        <Button variant="contained" color="tertiary" type='submit' sx={{ justifySelf: "center" }}>
                            Save Changes
                        </Button>
                    </Box>
                </Container>
    );
}
