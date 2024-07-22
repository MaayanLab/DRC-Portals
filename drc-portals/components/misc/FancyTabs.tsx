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
  label: React.ReactNode,
  priority?: number,
  hidden?: boolean,
  loading?: boolean,
  disabled?: boolean,
}
const FancyTabContext = React.createContext([undefined as string | undefined, (data: FancyTabProps) => {}] as const)

export function FancyTab(props: React.PropsWithChildren<FancyTabProps>) {
  const [currentTab, register] = React.useContext(FancyTabContext)
  React.useEffect(() => register({...props}), [props.label, props.id, props.priority, props.hidden, props.loading, props.disabled])
  if (props.id !== currentTab || props.hidden) return null
  return <>{props.children}</>
}

export function FancyTabs(props: React.PropsWithChildren<{
  defaultTab?: string,
  tab?: string,
  onChange?: (evt: any, tab: string) => void,
  preInitializationFallback?: React.ReactNode,
  postInitializationFallback?: React.ReactNode,
}>) {
  const [ctx, setCtx] = React.useState({ initialized: false, tabs: {} as Record<string, FancyTabProps> })
  const register = React.useCallback((props: FancyTabProps) => {
    setCtx(({ tabs }) => ({ initialized: true, tabs: {...tabs, [props.id]: props} }))
    return () => {
      setCtx(({ tabs: { [props.id]: _, ...tabs } }) => ({ initialized: true, tabs }))
    }
  }, [setCtx])
  const [tab, setTab] = React.useState(props.defaultTab)
  React.useEffect(() => {
    if (props.tab !== undefined)
      setTab(props.tab)
  }, [props.tab])
  const initializing_state = React.useMemo(() => {
    if (!ctx.initialized) return 'pre'
    else if (!Object.values(ctx.tabs).some(tab => tab.loading)) return 'post'
    else return 'initializing'
  }, [ctx.tabs])
  const tabs = React.useMemo(() => {
    const tabs = Object.values(ctx.tabs).filter(tab => !tab.hidden)
    tabs.sort((a, b) => (b.priority??0) - (a.priority??0))
    return tabs
  }, [ctx.tabs])
  const currentTab = React.useMemo(() => props.tab ?? tab ?? tabs.filter(tab => !tab.hidden && !tab.loading)[0]?.id, [props.tab, tab, tabs])
  React.useEffect(() => {
    if (initializing_state !== 'pre' && props.tab === undefined && props.onChange && currentTab !== undefined) {
      props.onChange(undefined, currentTab)
    }
  }, [initializing_state, props.tab, props.onChange, currentTab])
  return (
    <Grid container xs={12}>
      <Grid item xs={2} paddingRight={2}>
        <Tabs
          variant="scrollable"
          textColor='secondary'
          orientation="vertical"
          scrollButtons="auto"
          value={currentTab}
          onChange={props.onChange ?? ((evt, tab) => setTab(tab))}
        >
          {tabs.map(item => (
            <Tab
              key={item.id} 
              sx={{ fontSize: '14pt' }}
              label={item.label}
              value={item.id}
              disabled={item.disabled || item.loading}
            />
          ))}
        </Tabs>
      </Grid>
      <Grid item xs={10}>
        {tabs.length > 0 ? null
          : initializing_state === 'pre' ? props.preInitializationFallback
          : initializing_state === 'post' ? props.postInitializationFallback
          : null}
        <FancyTabContext.Provider value={[currentTab, register]}>
          {props.children}
        </FancyTabContext.Provider>
      </Grid>
    </Grid>
  )
}