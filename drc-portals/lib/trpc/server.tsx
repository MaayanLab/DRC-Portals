import { createCallerFactory } from '.'
import { appRouter } from './routers/_app'
const createCaller = createCallerFactory(appRouter)
const caller = createCaller({})
export default caller