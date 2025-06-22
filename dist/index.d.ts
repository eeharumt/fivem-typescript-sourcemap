/**
 * FiveM TypeScript Source Map Support Library
 *
 * A custom implementation optimized for FiveM environment that provides
 * accurate TypeScript stack traces by utilizing source maps.
 *
 * Features:
 * - Complete TypeScript file mapping (.js -> .ts)
 * - Accurate line number conversion
 * - FiveM resource path resolution
 * - V8 engine optimized implementation
 * - Comprehensive error handling
 *
 * Usage:
 * import { initializeSourceMapSupport } from 'fivem-typescript-sourcemap';
 * initializeSourceMapSupport();
 */
/**
 * Initialize source map support for FiveM TypeScript development
 *
 * @param options Configuration options
 * @param options.debug Enable debug logging (default: false)
 */
export declare function initializeSourceMapSupport(options?: {
    debug?: boolean;
}): void;
/**
 * Disable source map support
 */
export declare function disableSourceMapSupport(): void;
/**
 * Enable debug mode for source map support
 */
export declare function enableDebugMode(): void;
/**
 * Disable debug mode for source map support
 */
export declare function disableDebugMode(): void;
/**
 * Clear source map cache
 */
export declare function clearSourceMapCache(): void;
//# sourceMappingURL=index.d.ts.map