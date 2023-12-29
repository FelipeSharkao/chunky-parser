import dts from "bun-plugin-dts"

await Bun.build({
    target: "node",
    entrypoints: ["./src/index.ts"],
    outdir: "./dist",
    splitting: true,
    plugins: [dts({ libraries: { inlinedLibraries: ["type-fest"] } })],
})
