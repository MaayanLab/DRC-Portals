import { Prisma } from "@prisma/client";

/**
 * A SQL builder helper for constructing safe SQL.
 * 
 * Usage:
 *   const mytable = 'table'
 *   const select = SQL.template`select * from ${SQL.raw`${mytable}`}`
 *   const filters = [SQL.template`value = ${value}`, SQL.template`value2 = ${value2}`]
 *   const final = SQL.template`
 *     ${select}
 *     ${filters.length > 0 ? SQL.template`where ${SQL.join(' AND ', ...filters)}` : SQL.empty()}
 *   `.toPrismaSql()
 * 
 * Note that SQL.raw allows you to use variable substitution in templates but this is *opt-in* & discouraged
 * Normal variable substitution is converted to parameters
 * SQL itself can be provided in parameters
 */
export default class SQL {
  constructor(
    private parts: ({ type: 'raw', sql: string } | { type: 'param', value: unknown })[] = [],
  ) {}
  isEmpty(): boolean {
    return this.parts.length === 0
  }
  static empty(): SQL {
    return new SQL()
  }
  static raw(strings: TemplateStringsArray, ...variables: string[]): SQL {
    return new SQL(strings.flatMap((sql, i) => i > 0 ? [{ type: 'raw', sql: variables[i-1] }, { type: 'raw', sql }] : [{ type: 'raw', sql }]))
  }
  static param(value: unknown): SQL {
    return new SQL([{ type: 'param', value }])
  }
  static assert_in<T>(value: T, valid: T[]) {
    if (!valid.includes(value)) throw new Error(`${value} not in ${valid}`)
    return value
  }
  static join(sep: string, ...parts: SQL[]): SQL {
    return new SQL(parts.flatMap((part, i) => i > 0 ? [{ type: 'raw', sql: sep }, ...part.parts] : part.parts))
  }
  static template(strings: TemplateStringsArray, ...variables: (SQL | unknown)[]) {
    return new SQL(strings.flatMap((sql, i) => {
      if (i > 0) {
        const variable = variables[i-1]
        if (variable instanceof SQL) {
          return [...variable.parts, { type: 'raw', sql }]
        } else {
          return [{ type: 'param', value: variable }, { type: 'raw', sql }]
        }
      } else {
        return [{ type: 'raw', sql }]
      }
    }))
  }
  toPrismaSql(): Prisma.Sql {
    let param = 1
    let sql = ''
    let values = [] as unknown[]
    for (const part of this.parts) {
      if (part.type === 'raw') {
        sql += part.sql
      } else if (part.type === 'param') {
        sql += `$${param++}`
        values.push(part.value)
      }
    }
    const query = Prisma.raw(sql)
    Object.assign(query, { values })
    return query
  }
}
