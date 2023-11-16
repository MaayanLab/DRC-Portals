import Nav from "@/components/Nav";

export default function Layout({ children }: React.PropsWithChildren<{}>) {
    return (
      <>
        <Nav />
        {children}
      </>
    )
  }
