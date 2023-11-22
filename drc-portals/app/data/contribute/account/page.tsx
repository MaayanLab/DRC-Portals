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

    async function saveuser(formData: FormData) {
        'use server'
        const email = formData.get('email')
        const dcc = formData.get('DCC')
        console.log(dcc?.toString())

        if (!email) throw new Error('Missing email')
        if (!dcc) throw new Error('Missing dcc')

       // add dcc to user in db
        console.log('update')
        await prisma.user.update({
            where: {
                id: session?.user.id,
            },
            data: {
                email: email.toString(),
                dcc: dcc?.toString()
            },
        });
        revalidatePath('/data/contribute/account')
    }


    return (
        <>
            <Container className="mt-10 justify-content-center">
                <Typography variant="h3" className='text-center p-5'>Account Information</Typography>
                <Typography variant="body2" className='text-center p-5'>Please complete account information before approving or the uploading forms</Typography>
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
                        inputProps={{style: {fontSize: 16}}} // font size of input text
                        InputLabelProps={{style: {fontSize: 16}}} // font size of input label
                    />
                    <TextField
                        id="input-email"
                        label="Email"
                        name='email'
                        defaultValue={user.email}
                        inputProps={{style: {fontSize: 16}}}
                        InputLabelProps={{style: {fontSize: 16}}}
                        required
                    />
                    <MultiSelect
                        name='DCC'
                        label="DCC"
                        options={names}
                        defaultValue={user.dcc?.split(',')}
                    />

                    <Button variant="contained" color="tertiary" type='submit' sx={{justifySelf:"center"}}>
                        Request Information Change
                    </Button>
                </Box>
            </Container>
        </>
    );
}
