# Chunky Parser

Lightweight LL(0) parser combinator library for TypeScript with support for direct and indirect left
and right recursion.

## Example

```ts
type Color = {
  red: number;
  green: number;
  blue: number;
};

const hexDigit = anyIn('09', 'af', 'AF');

const hexPrimary = (length: number) => map(
  raw(many(hexDigit, length, length)),
  (res) => parseInt(res.value, 16)
));

const colorL = (length: number) => map(
  seq(str('#'), hexPrimary(length), hexPrimary(length), hexPrimary(length)),
  (res) => ({ red: res.value[1], green: res.value[2], blue: res.value[3] })
);

const color: Parser<Color> = named('Hex Color', oneOf(colorL(1), colorL(2)));

const source = {
  name: 'filename',
  path: '/path/to/filename',
  content: '#ff0085'
};

const result = parse(color, source, {}); // { red: 255, green: 0, blue: 133 }
```
