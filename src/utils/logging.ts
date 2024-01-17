import type { ParseInput } from "@/ParseInput"

export function printLog(input: ParseInput, ...args: unknown[]) {
    if (input.context.log?.enabled) {
        console.log(
            "[LOG]" + " |".repeat(input.context.log.indent ?? 0),
            ...args.map((arg) => (typeof arg == "string" ? arg : JSON.stringify(arg)))
        )
    }
}

export function printGroup(input: ParseInput, ...args: unknown[]) {
    if (input.context.log?.enabled) {
        printLog(input, ...args, "{{")
        input.context.log.indent = (input.context.log.indent ?? 0) + 1
    }
}

export function printGroupEnd(input: ParseInput, ...args: unknown[]) {
    if (input.context.log?.enabled) {
        if (input.context.log.indent) {
            input.context.log.indent -= 1
        }
        printLog(input, "}}", ...args)
    }
}
