# FiveM TypeScript Source Map Support

A source map support library for FiveM resources, enabling accurate TypeScript debugging with proper stack traces.

## Installation

### Package Installation

```bash
# Using pnpm (recommended)
pnpm add @eeharumt/fivem-typescript-sourcemap

# Using npm
npm install @eeharumt/fivem-typescript-sourcemap
```

### Basic Usage

Add the following to the top of your main server/client entry file:

```typescript
// src/server/index.ts
import { initializeSourceMapSupport } from '@eeharumt/fivem-typescript-sourcemap';

// Initialize source map support
initializeSourceMapSupport({ debug: true });

// Your code continues here...
console.log('Server starting');
```

### FiveM Configuration

Add the following to your `fxmanifest.lua`:

```lua
-- Include source map files for debugging
files {
    'build/server/**/*.js.map',
    'build/client/**/*.js.map'
}
```

## Configuration

### TypeScript Configuration

Ensure your `tsconfig.json` includes proper source map settings:

```json
{
  "compilerOptions": {
    "sourceMap": true,
    "inlineSourceMap": false,
    "sourceRoot": "../src",
    "outDir": "./build"
  }
}
```

### Complete FiveM Manifest Example

```lua
fx_version 'cerulean'
game 'gta5'

server_scripts { 'build/server/**/*.js' }
client_scripts { 'build/client/**/*.js' }

-- Essential: Include source map files
files {
    'build/server/**/*.js.map',
    'build/client/**/*.js.map'
}
```

## Stack Trace Comparison

### Before (Compiled JavaScript)
```
Error: Custom error message
    at throwError (@your-resource/build/server/index.js:45:11)
    at Object.callback (@your-resource/build/server/index.js:78:17)
```

### After (Original TypeScript)
```
Error: Custom error message
    at throwError (src/server/index.ts:120:11)    ← TypeScript file!
    at <anonymous> (src/server/index.ts:156:17)   ← Accurate line numbers!
```

## API Reference

### initializeSourceMapSupport(options?)

Initializes source map support for the current resource.

```typescript
import { initializeSourceMapSupport } from '@eeharumt/fivem-typescript-sourcemap';

// Basic initialization
initializeSourceMapSupport();

// With debug mode enabled
initializeSourceMapSupport({ debug: true });
```

**Options:**
- `debug` (boolean): Enable detailed logging for troubleshooting

### enableDebugMode() / disableDebugMode()

Toggle debug mode at runtime:

```typescript
import { enableDebugMode, disableDebugMode } from '@eeharumt/fivem-typescript-sourcemap';

enableDebugMode();  // Enable detailed logging
disableDebugMode(); // Disable detailed logging
```

### clearSourceMapCache()

Clear the internal source map cache:

```typescript
import { clearSourceMapCache } from '@eeharumt/fivem-typescript-sourcemap';

clearSourceMapCache(); // Useful during development hot-reloading
```

## Testing

You can test the source map functionality with this command:

```typescript
RegisterCommand('test-sourcemap', () => {
  try {
    const testFunction = () => {
      throw new Error('Source map test error');
    };
    testFunction();
  } catch (error) {
    console.error('Stack trace (should show TypeScript line numbers):');
    console.error(error.stack);
  }
}, false);
```

## Troubleshooting

### Source Maps Not Working

1. **Check fxmanifest.lua**:
   ```lua
   files {
       'build/**/*.js.map'  -- Ensure this is included
   }
   ```

2. **Verify TypeScript Build**:
   ```bash
   # Check if .js.map files are generated
   ls -la build/server/*.js.map
   ```

3. **Enable Debug Mode**:
   ```typescript
   initializeSourceMapSupport({ debug: true });
   ```

### Common Issues

| Issue | Solution |
|-------|----------|
| Incorrect line numbers | Check `sourceRoot` configuration in tsconfig.json |
| Wrong file paths | Verify `files` configuration in fxmanifest.lua |
| Performance issues | Use `debug: false` in production environments |

## Requirements

- FiveM Server/Client
- TypeScript project with source maps enabled
- Node.js modules support in your resource

## License

MIT License - see [LICENSE](LICENSE) file for details.

---
