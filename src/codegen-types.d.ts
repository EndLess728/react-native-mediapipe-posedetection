declare module 'react-native/Libraries/Types/CodegenTypes' {
  import type { EventSubscription } from 'react-native';

  export type Double = number;
  export type Float = number;
  export type Int32 = number;
  export type UnsafeObject = Object;
  export type UnsafeMixed = unknown;

  export type EventEmitter<T> = (
    handler: (event: T) => void | Promise<void>
  ) => EventSubscription;
}
