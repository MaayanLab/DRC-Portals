'use server'
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { getServerSession } from "next-auth";
import { redirect } from 'next/navigation';
import { Link } from '@mui/material';
import { AccountForm } from './AccountForm';

export default async function AccountPage() {
    const session = await getServerSession(authOptions)
    if (!session) return redirect("/auth/signin?callbackUrl=/data/submit/account")
    const user = await prisma.user.findUnique({
        where: {
            id: session.user.id,
        },
        include: {
            dccs: true
        }
    })

    if (user === null) return redirect("/auth/signin?callbackUrl=/data/submit/account")


    return (
        <Container className="justify-content-center">
            <Typography variant="h3" color="secondary.dark" className='p-5'>ACCOUNT INFORMATION</Typography>
            <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
                Please complete account email information before approving or the uploading forms.
                If the email field is empty, this information can only be saved once. For all
                other information updates to your user account (role or DCC), please contact
                the DRC to update your information at <Link href="mailto:help@cfde.cloud" color='secondary'>help@cfde.cloud</Link>.
            </Typography>
            <AccountForm user={user} />
        </Container>
    );
}
