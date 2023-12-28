# Chunky.ts

Lightweight parser combinator library for TypeScript.

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

const colorL = (length: number) => seq(
  str('#'),
  label('red', hexPrimary(length)),
  label('green', hexPrimary(length)),
  label('blue', hexPrimary(length))
);

const color: Parser<Color> = named('Hex Color', oneOf(colorL(1), colorL(2))
);

const result = parse(color, '#ff0085'); // { red: 255, green: 0, blue: 133 }
```
