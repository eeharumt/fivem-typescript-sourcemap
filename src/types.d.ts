// FiveM TypeScript definitions for Source Map Support

declare global {
  // FiveM Native Functions
  function LoadResourceFile(resourceName: string, fileName: string): string | null;
  function GetCurrentResourceName(): string;
  function GetConvar(varName: string, defaultValue: string): string;
  function IsDuplicityVersion(): boolean;
  function RegisterCommand(commandName: string, handler: Function, restricted?: boolean): void;
  function GetGameTimer(): number;

  // V8 CallSite interface for Error.prepareStackTrace
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

  // Error interface extension
  interface Error {
    prepareStackTrace?: (err: Error, stackTraces: CallSite[]) => any;
  }

  // Node.js global
  namespace NodeJS {
    interface Global {
      Error: ErrorConstructor;
    }
  }
}

export {}; 