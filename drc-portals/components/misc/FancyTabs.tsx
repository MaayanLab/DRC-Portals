'use client'
/**
 * Usage:
 * <FancyTabs>
 *   <FancyTab id="unique-string" label="Human String">Contents of the tab</FancyTab>
 *   ...
 * </FancyTabs>
 * 
 * They're fancy because 1:
 *   - the tabs and the content are coupled in the container
 *   - you can load/unload the tabs asynchronously
 */
import React from "react";
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { Grid } from "@mui/material";

type FancyTabProps = {
  id: string,
  label: string,
  priority?: number,
}
const FancyTabContext = React.createContext([undefined as string | undefined, (data: FancyTabProps) => {}] as const)

export function FancyTab(props: React.PropsWithChildren<FancyTabProps>) {
  const [currentTab, register] = React.useContext(FancyTabContext)
  React.useEffect(() => register(props), [props.label, props.id])
  if (props.id !== currentTab) return null
  return <>{props.children}</>
}

export function FancyTabs(props: React.PropsWithChildren<{
  defaultTab?: string,
  tab?: string,
  onChange?: (evt: any, tab: string) => void,
  fallback?: React.ReactNode,
}>) {
  const [ctx, setCtx] = React.useState({} as Record<string, FancyTabProps>)
  const register = React.useCallback((props: FancyTabProps) => {
    setCtx(ctx => ({ ...ctx, [props.id]: props }))
    return () => {
      setCtx(({ [props.id]: _, ...ctx }) => ctx)
    }
  }, [setCtx])
  const [tab, setTab] = React.useState(props.defaultTab)
  React.useEffect(() => {
    if (props.tab !== undefined)
      setTab(props.tab)
  }, [props.tab])
  const tabs = React.useMemo(() => {
    const tabs = Object.values(ctx)
    tabs.sort((a, b) => (b.priority??0) - (a.priority??0))
    return tabs
  }, [ctx])
  const currentTab = React.useMemo(() => props.tab ?? tab ?? tabs[0]?.id, [props.tab, tab, tabs])
  return (
    <Grid>
      <Tabs
        variant='fullWidth'
        textColor='secondary'
        value={currentTab}
        onChange={props.onChange ?? ((evt, tab) => setTab(tab))}
      >
        {tabs.map(item => (
          <Tab
            key={item.id} 
            sx={{ fontSize: '14pt' }}
            label={item.label}
            value={item.id}
          />
        ))}
      </Tabs>
      {tabs.length === 0 ? props.fallback : null}
      <FancyTabContext.Provider value={[currentTab, register]}>
        {props.children}
      </FancyTabContext.Provider>
    </Grid>
  )
}