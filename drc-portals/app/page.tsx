import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

export default async function Home() {
  const session = await getServerSession(authOptions)
  return (
    <main className="flex flex-col min-h-screen justify-around items-stretch">
      <div className="flex justify-center">
        {session === null ? <Link href="/auth/signin"><button>Login</button></Link>
          : <>
            Welcome {session.user?.name ?? 'user'}.
            <Link href="/auth/signout"><button>Logout</button></Link>
          </>}
      </div>
      <div className="flex-grow flex flex-row justify-around content-around align-middle items-center">
        <Link href="/data">
          <div className="max-w-sm rounded overflow-hidden shadow-lg hover:shadow-2xl cursor-pointer">
            <div className="px-6 py-4">
              <div className="font-bold text-xl mb-2">Data Resource Portal</div>
              <p className="text-gray-700 text-base">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatibus quia, nulla! Maiores et perferendis eaque, exercitationem praesentium nihil.
              </p>
            </div>
          </div>
        </Link>
        <Link href="/info">
          <div className="max-w-sm rounded overflow-hidden shadow-lg hover:shadow-2xl cursor-pointer">
            <div className="px-6 py-4">
              <div className="font-bold text-xl mb-2">Information Portal</div>
              <p className="text-gray-700 text-base">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatibus quia, nulla! Maiores et perferendis eaque, exercitationem praesentium nihil.
              </p>
            </div>
          </div>
        </Link>
      </div>
    </main>
  )
}
