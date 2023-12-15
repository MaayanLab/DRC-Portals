import Signin from "./Signin";
import UserAvatar from "./UserAvatar";
import { Session } from 'next-auth';

export default function UserComponent ({session}: {session: Session | null})  {
    if (session === null) {
        return <Signin/>
    } else {
        return <UserAvatar session={session}/>
    }
}