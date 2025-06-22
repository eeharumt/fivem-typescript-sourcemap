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

// FiveM Type Definitions
declare function LoadResourceFile(resourceName: string, fileName: string): string | null;
declare function GetCurrentResourceName(): string;

interface CallSite {
  getThis(): any;
  getTypeName(): string | null;
  getFunctionName(): string | null;
  getMethodName(): string | null;
  getFileName(): string | null;
  getLineNumber(): number | null;
  getColumnNumber(): number | null;
  isEval(): boolean;
  isNative(): boolean;
  isConstructor(): boolean;
  toString(): string;
}

interface SourceMapV3 {
    version: number;
    sources: string[];
    names: string[];
    mappings: string;
    file?: string;
    sourceRoot?: string;
    sourcesContent?: string[];
  }
  
  interface MappingItem {
    generatedLine: number;
    generatedColumn: number;
    originalLine?: number;
    originalColumn?: number;
    source?: string;
    name?: string;
  }
  
  class FiveMSourceMapSupport {
    private sourceMapCache = new Map<string, SourceMapV3>();
    private mappingCache = new Map<string, MappingItem[]>();
    private originalPrepareStackTrace: any;
    private debugMode: boolean = false;
  
    constructor(options: { debug?: boolean } = {}) {
      this.debugMode = options.debug || false;
      this.originalPrepareStackTrace = Error.prepareStackTrace;
    }
  
    /**
     * Initialize source map support
     */
    public initialize(): void {
      if (this.debugMode) {
        console.log('[FiveMSourceMap] Initializing source map support...');
      }
  
      Error.prepareStackTrace = (error: Error, structuredStackTrace: CallSite[]) => {
        return this.prepareStackTrace(error, structuredStackTrace);
      };
  
      if (this.debugMode) {
        console.log('[FiveMSourceMap] Source map support initialized successfully');
      }
    }
  
    /**
     * Disable source map support and restore original behavior
     */
    public disable(): void {
      Error.prepareStackTrace = this.originalPrepareStackTrace;
      this.sourceMapCache.clear();
      this.mappingCache.clear();
  
      if (this.debugMode) {
        console.log('[FiveMSourceMap] Source map support disabled');
      }
    }
  
    /**
     * Custom stack trace preparation
     */
    private prepareStackTrace(error: Error, structuredStackTrace: CallSite[]): string {
      const errorString = `${error.name}: ${error.message}`;
      const stackLines: string[] = [];
  
      for (const callSite of structuredStackTrace) {
        const frame = this.mapCallSite(callSite);
        if (frame) {
          stackLines.push(`    at ${frame}`);
        }
      }
  
      return `${errorString}\n${stackLines.join('\n')}`;
    }
  
        /**
     * Map a call site to its original TypeScript location
     */
    private mapCallSite(callSite: CallSite): string | null {
      try {
        const fileName = callSite.getFileName();
        const lineNumber = callSite.getLineNumber();
        const columnNumber = callSite.getColumnNumber();
        const functionName = callSite.getFunctionName() || callSite.getMethodName() || '<anonymous>';

        if (!fileName || !lineNumber) {
          return `${functionName} (${fileName || 'unknown'}:${lineNumber || '?'}:${columnNumber || '?'})`;
        }

        // Check if this is a JavaScript file that might have a source map
        if (!fileName.endsWith('.js')) {
          return `${functionName} (${fileName}:${lineNumber}:${columnNumber || '?'})`;
        }

        const originalPosition = this.getOriginalPosition(fileName, lineNumber, columnNumber || 0);

        if (originalPosition) {
          const { source, line, column } = originalPosition;
          return `${functionName} (${source}:${line}:${column})`;
        }

        // Fallback to original location
        return `${functionName} (${fileName}:${lineNumber}:${columnNumber || '?'})`;

      } catch (err) {
        if (this.debugMode) {
          console.error('[FiveMSourceMap] Error mapping call site:', err);
        }
        return null;
      }
    }
  
    /**
     * Get original position from source map
     */
    private getOriginalPosition(fileName: string, line: number, column: number): { source: string; line: number; column: number } | null {
      const sourceMap = this.getSourceMap(fileName);
      if (!sourceMap) {
        return null;
      }
  
      const mappings = this.getMappings(fileName, sourceMap);
      if (!mappings) {
        return null;
      }
  
      // Find the closest mapping for the given position
      const mapping = this.findClosestMapping(mappings, line, column);
      if (!mapping || mapping.originalLine === undefined || mapping.originalColumn === undefined || !mapping.source) {
        return null;
      }
  
      // Convert source path to TypeScript file
      let originalSource = mapping.source;
      
      // Handle relative paths and convert to absolute resource paths
      if (originalSource.startsWith('./') || originalSource.startsWith('../')) {
        originalSource = this.resolveRelativePath(fileName, originalSource);
      }
  
      // Clean up the source path for better display
      originalSource = this.cleanSourcePath(originalSource);
  
      return {
        source: originalSource,
        line: mapping.originalLine + 1, // Source maps use 0-based indexing
        column: mapping.originalColumn + 1
      };
    }
  
    /**
     * Get source map for a JavaScript file
     */
    private getSourceMap(fileName: string): SourceMapV3 | null {
      if (this.sourceMapCache.has(fileName)) {
        return this.sourceMapCache.get(fileName)!;
      }
  
      try {
        const sourceMapPath = `${fileName}.map`;
        const resolvedPath = this.resolveFiveMPath(sourceMapPath);
  
        if (this.debugMode) {
          console.log(`[FiveMSourceMap] Loading source map: ${sourceMapPath} -> ${resolvedPath}`);
        }
  
        const sourceMapContent = LoadResourceFile(GetCurrentResourceName(), resolvedPath);
        
        if (!sourceMapContent) {
          if (this.debugMode) {
            console.warn(`[FiveMSourceMap] Source map not found: ${resolvedPath}`);
          }
          return null;
        }
  
        const sourceMap: SourceMapV3 = JSON.parse(sourceMapContent);
        this.sourceMapCache.set(fileName, sourceMap);
  
        if (this.debugMode) {
          console.log(`[FiveMSourceMap] Source map loaded successfully for ${fileName}`);
        }
  
        return sourceMap;
  
      } catch (err) {
        if (this.debugMode) {
          console.error(`[FiveMSourceMap] Error loading source map for ${fileName}:`, err);
        }
        return null;
      }
    }
  
    /**
     * Get mappings from source map
     */
    private getMappings(fileName: string, sourceMap: SourceMapV3): MappingItem[] | null {
      if (this.mappingCache.has(fileName)) {
        return this.mappingCache.get(fileName)!;
      }
  
      try {
        const mappings = this.parseMappings(sourceMap);
        this.mappingCache.set(fileName, mappings);
        return mappings;
      } catch (err) {
        if (this.debugMode) {
          console.error(`[FiveMSourceMap] Error parsing mappings for ${fileName}:`, err);
        }
        return null;
      }
    }
  
    /**
     * Parse VLQ encoded mappings from source map
     * Simplified implementation for FiveM environment
     */
    private parseMappings(sourceMap: SourceMapV3): MappingItem[] {
      const mappings: MappingItem[] = [];
      const lines = sourceMap.mappings.split(';');
      
      let generatedLine = 0;
      let previousGeneratedColumn = 0;
      let previousSource = 0;
      let previousOriginalLine = 0;
      let previousOriginalColumn = 0;
  
      for (const line of lines) {
        if (!line) {
          generatedLine++;
          previousGeneratedColumn = 0;
          continue;
        }
  
        const segments = line.split(',');
        let generatedColumn = previousGeneratedColumn;
  
        for (const segment of segments) {
          if (!segment) continue;
  
          const decoded = this.decodeVLQ(segment);
          if (decoded.length === 0) continue;
  
          generatedColumn += decoded[0];
  
          let mapping: MappingItem = {
            generatedLine: generatedLine + 1,
            generatedColumn: generatedColumn + 1
          };
  
          if (decoded.length >= 4) {
            const sourceIndex = previousSource + decoded[1];
            const originalLine = previousOriginalLine + decoded[2];
            const originalColumn = previousOriginalColumn + decoded[3];
  
            if (sourceIndex >= 0 && sourceIndex < sourceMap.sources.length) {
              mapping.source = sourceMap.sources[sourceIndex];
              mapping.originalLine = originalLine;
              mapping.originalColumn = originalColumn;
  
              previousSource = sourceIndex;
              previousOriginalLine = originalLine;
              previousOriginalColumn = originalColumn;
            }
          }
  
          mappings.push(mapping);
        }
  
        generatedLine++;
        previousGeneratedColumn = 0;
      }
  
      return mappings;
    }
  
    /**
     * Simple VLQ decoder for source map mappings
     */
    private decodeVLQ(encoded: string): number[] {
      const VLQ_BASE_SHIFT = 5;
      const VLQ_BASE = 1 << VLQ_BASE_SHIFT;
      const VLQ_BASE_MASK = VLQ_BASE - 1;
      const VLQ_CONTINUATION_BIT = VLQ_BASE;
  
      const charToInt: { [key: string]: number } = {};
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      for (let i = 0; i < chars.length; i++) {
        charToInt[chars[i]] = i;
      }
  
      const result: number[] = [];
      let shift = 0;
      let value = 0;
  
      for (let i = 0; i < encoded.length; i++) {
        const char = encoded[i];
        const integer = charToInt[char];
        
        if (integer === undefined) continue;
  
        const hasContinuationBit = integer & VLQ_CONTINUATION_BIT;
        value += (integer & VLQ_BASE_MASK) << shift;
  
        if (hasContinuationBit) {
          shift += VLQ_BASE_SHIFT;
        } else {
          const shouldNegate = value & 1;
          value >>>= 1;
          if (shouldNegate) {
            value = -value;
          }
          result.push(value);
          value = 0;
          shift = 0;
        }
      }
  
      return result;
    }
  
    /**
     * Find the closest mapping for given line and column
     */
    private findClosestMapping(mappings: MappingItem[], line: number, column: number): MappingItem | null {
      let closest: MappingItem | null = null;
      let closestDistance = Infinity;
  
      for (const mapping of mappings) {
        if (mapping.generatedLine > line) {
          break;
        }
  
        if (mapping.generatedLine === line && mapping.generatedColumn <= column) {
          const distance = column - mapping.generatedColumn;
          if (distance < closestDistance) {
            closest = mapping;
            closestDistance = distance;
          }
        } else if (mapping.generatedLine < line) {
          if (!closest || mapping.generatedLine > closest.generatedLine) {
            closest = mapping;
          }
        }
      }
  
      return closest;
    }
  
    /**
     * Resolve FiveM resource paths
     */
    private resolveFiveMPath(path: string): string {
      // Remove @resource-name/ prefix if present
      if (path.startsWith('@')) {
        const slashIndex = path.indexOf('/');
        if (slashIndex !== -1) {
          path = path.substring(slashIndex + 1);
        }
      }
  
      // Convert backslashes to forward slashes
      path = path.replace(/\\/g, '/');
  
      return path;
    }
  
    /**
     * Resolve relative paths
     */
    private resolveRelativePath(basePath: string, relativePath: string): string {
      const baseDir = basePath.substring(0, basePath.lastIndexOf('/'));
      const parts = relativePath.split('/').filter(part => part !== '.');
      const baseParts = baseDir.split('/');
  
      for (const part of parts) {
        if (part === '..') {
          baseParts.pop();
        } else {
          baseParts.push(part);
        }
      }
  
      return baseParts.join('/');
    }
  
    /**
     * Clean source path for better display
     */
    private cleanSourcePath(sourcePath: string): string {
      // Remove build directories and normalize path
      sourcePath = sourcePath.replace(/\/build\//, '/');
      sourcePath = sourcePath.replace(/\\/g, '/');
      
      // Convert .js extensions to .ts if they exist in TypeScript source
      if (sourcePath.endsWith('.js')) {
        const tsPath = sourcePath.replace(/\.js$/, '.ts');
        // In a real implementation, you might want to check if the .ts file exists
        sourcePath = tsPath;
      }
  
      return sourcePath;
    }
  
    /**
     * Enable debug mode
     */
    public enableDebug(): void {
      this.debugMode = true;
      console.log('[FiveMSourceMap] Debug mode enabled');
    }
  
    /**
     * Disable debug mode
     */
    public disableDebug(): void {
      this.debugMode = false;
    }
  
    /**
     * Clear all caches
     */
    public clearCache(): void {
      this.sourceMapCache.clear();
      this.mappingCache.clear();
      
      if (this.debugMode) {
        console.log('[FiveMSourceMap] Cache cleared');
      }
    }
  }
  
  // Global instance
  let sourceMapSupportInstance: FiveMSourceMapSupport | null = null;
  
  /**
   * Initialize source map support for FiveM TypeScript development
   * 
   * @param options Configuration options
   * @param options.debug Enable debug logging (default: false)
   */
  export function initializeSourceMapSupport(options: { debug?: boolean } = {}): void {
    if (sourceMapSupportInstance) {
      console.warn('[FiveMSourceMap] Source map support is already initialized');
      return;
    }
  
    sourceMapSupportInstance = new FiveMSourceMapSupport(options);
    sourceMapSupportInstance.initialize();
  }
  
  /**
   * Disable source map support
   */
  export function disableSourceMapSupport(): void {
    if (sourceMapSupportInstance) {
      sourceMapSupportInstance.disable();
      sourceMapSupportInstance = null;
    }
  }
  
  /**
   * Enable debug mode for source map support
   */
  export function enableDebugMode(): void {
    if (sourceMapSupportInstance) {
      sourceMapSupportInstance.enableDebug();
    }
  }
  
  /**
   * Disable debug mode for source map support
   */
  export function disableDebugMode(): void {
    if (sourceMapSupportInstance) {
      sourceMapSupportInstance.disableDebug();
    }
  }
  
  /**
   * Clear source map cache
   */
  export function clearSourceMapCache(): void {
    if (sourceMapSupportInstance) {
      sourceMapSupportInstance.clearCache();
    }
  }
  
  // Auto-initialize if running in FiveM environment
  if (typeof GetCurrentResourceName === 'function') {
    // Auto-initialize with debug mode based on environment
    const isDebug = GetConvar('developer', '0') !== '0' || GetConvar('sv_fivem_debug', '0') !== '0';
    initializeSourceMapSupport({ debug: isDebug });
  }