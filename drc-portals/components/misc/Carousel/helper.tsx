import {Theme, useTheme } from '@mui/material/styles' // or @mui/joy/styles
import useMediaQuery from "@mui/material/useMediaQuery";
import {Breakpoint} from "@mui/system";

/**
 * taken from https://material-ui.com/components/use-media-query/#migrating-from-withwidth
 *
 * Be careful using this hook. It only works because the number of
 * breakpoints in theme is static. It will break once you change the number of
 * breakpoints. See https://reactjs.org/docs/hooks-rules.html#only-call-hooks-at-the-top-level
 */
type BreakpointOrNull = Breakpoint | null

export const useWidth = (): Breakpoint => {
    const theme: Theme = useTheme()
    const keys: readonly Breakpoint[] = [...theme.breakpoints.keys]
    return (
        keys.reduce((output: BreakpointOrNull, key: Breakpoint) => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const matches = useMediaQuery(theme.breakpoints.up(key))
            return matches ? key : output
        }, null) ?? 'xs'
    )
}