# Authentication

## Configuration
```bash
# Generate a secure NEXTAUTH_SECRET
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" >> .env

# Configure the applicable provider in .env
#NEXTAUTH_EMAIL={"server":"smtps://user:pass@smtp-server:465","from":"user@example.com"}
#NEXTAUTH_GITHUB={"clientId":"","clientSecret":""}
#NEXTAUTH_GOOGLE={"clientId":"","clientSecret":""}
#NEXTAUTH_ORCID={"clientId":"","clientSecret":""}
```

## Usage

### Session in API Routes
```ts
import { authOptions } from '@/app/auth'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // session will have your user's authentication information
  const session = await getServerSession(authOptions)
  console.log(session)
  return NextResponse.json({
    id: 1,
  })
}
```

### Session in Server Components
```tsx
import { authOptions } from '@/app/auth'
import { getServerSession } from 'next-auth'

export default function MyComponent() {
  const session = await getServerSession(authOptions)
}
```

### Session in Client Components
```tsx
'use client';

import { useSession } from 'next-auth/react'

export default function ClientComponent() {
  const { data: session, status } = useSession()
  return (
    <div>
      ClientComponent {status}{' '}
      {status === 'authenticated' && session.user?.name}
    </div>
  )
}
```
