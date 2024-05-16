import Signin from "./Signin";
import UserAvatar from "./UserAvatar";
import MenuItem from '@mui/material/MenuItem';
import { SignOutLink } from '@/lib/auth/links';
import { AccountLink } from './MyAccount';
import { Session } from 'next-auth';
import getKeycloakInfo from "@/lib/auth/keycloakInfo";

export default async function UserComponent ({session}: {session: Session | null})  {
    if (session === null) {
        return <Signin/>
    } else {
        const userInfo = await getKeycloakInfo(session.user)
        return (
            <UserAvatar session={session}>
                <MenuItem>
                    <AccountLink />
                </MenuItem>
                {userInfo?.roles?.includes('ADMIN') ?
                    <MenuItem>
                        <a href={`https://auth.cfde.cloud/admin/cfde/console/`}>Admin Console</a>
                    </MenuItem>
                    : null}
                <MenuItem>
                    <SignOutLink>Logout</SignOutLink>
                </MenuItem>
            </UserAvatar>
        )
    }
}
