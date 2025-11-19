# AVFlowView3dApp – Public API Reference

The main programmatic entrypoint for embedding, automation, and agent-driven orchestration.

## Constructor

```js
const app = new AVFlowView3dApp(container, config?);
```

- `container`: DOM element or selector string.
- `config`: Optional object for customizing theme, controls, and performance options.

## Public Methods

### `load(graphJson)`

Validate, convert, and render the supplied AV wiring graph.

- **Input:** JSON object (must conform to schema)
- **Returns:** `{ success: boolean, error?: object }` (see error envelope in docs/TECHNICAL_SPECS.md)

### `update(graphJson)`

Diffs and rerenders new graph data.

- **Input:** JSON object
- **Returns:** as in `load`

### `setFocus(nodeIdOrEdgeId, distance)`

Programmatic focus/context highlighting.

- **Input:** string (node/edge id), integer (hop distance)

### `export(type)`

Exports the rendered diagram.

- **Input:** `'svg'` or `'png'`
- **Returns:** Data URI string or triggers download

## Events

- Fires `onGraphLoaded`, `onValidationError`, `onFocusChange` events; attach with:

```js
app.on('event', handlerFn);
```

## Example

```js
const app = new AVFlowView3dApp('#container');
app.load(validGraphJson);
app.setFocus('mix1', 2);
document.getElementById('exportSvgBtn').onclick = () => {
  const svgData = app.export('svg');
  // ...do something with svgData
};
```

## Contract

- All methods must be idempotent, side-effect-free where possible.
- All error returns must follow the structure in TECHNICAL_SPECS.md.
