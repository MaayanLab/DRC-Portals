import Signin from "./Signin";
import UserAvatar from "./UserAvatar";
import MenuItem from '@mui/material/MenuItem';
import { SignOutLink } from '@/lib/auth/links';
import { AccountLink } from './MyAccount';
import { Session } from 'next-auth';

export default function UserComponent ({session}: {session: Session | null})  {
    if (session === null) {
        return <Signin/>
    } else {
        return (
            <UserAvatar session={session}>
                {session.keycloakInfo ?
                    <MenuItem>
                        <AccountLink />
                    </MenuItem>
                    : null}
                {session.keycloakInfo?.roles?.includes('ADMIN') ?
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
