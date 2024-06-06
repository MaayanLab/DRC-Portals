import Link from '@mui/material/Link';

export default function DisableableLink({ disabled, children, ...props }: React.PropsWithChildren<{ disabled?: boolean }> & Exclude<React.ComponentProps<typeof Link>, 'children'>) {
  return disabled ? children : <Link {...props}>{children}</Link>
}
