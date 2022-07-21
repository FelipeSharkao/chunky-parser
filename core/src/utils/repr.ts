const symHash = new Map<symbol, number>()
function symId(sym: symbol) {
  const curr = symHash.get(sym)
  if (curr != null) {
    return curr
  } else {
    const id = symHash.size
    symHash.set(sym, id)
    return id
  }
}

const funcHash = new Map<Function, number>()
function funcId(func: Function) {
  const curr = funcHash.get(func)
  if (curr != null) {
    return curr
  } else {
    const id = funcHash.size
    funcHash.set(func, id)
    return id
  }
}

/**
 * Retorna uma representação do objeto.
 * Um objeto com as mesmas chaves e valores deverá ter a mesma string.
 * Requer ES6+
 */
export function repr(v: any): string {
  if (typeof v == 'object' && v != null) {
    const constructor = Object.getPrototypeOf(v).constructor.name
    if (Array.isArray(v)) {
      return `${constructor}[${v.map(repr).join(',')}]`
    }
    if (typeof v.toJSON == 'function') {
      return `${constructor}(${repr(v.toJSON())})`
    }
    return `${constructor}{${[
      ...Object.getOwnPropertyNames(v).sort(),
      ...Object.getOwnPropertySymbols(v).sort((a, b) => symId(a) - symId(b)),
    ]
      .map((k) => `${repr(k)}:${repr(v[k])}`)
      .join(',')}}`
  }
  if (typeof v == 'symbol') {
    return `Symbol*${symId(v)}(${v.description || ''})`
  }
  if (typeof v == 'function') {
    return `Function*${funcId(v)}(${v.name || ''})`
  }
  return JSON.stringify(v)
}
