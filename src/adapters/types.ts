/**
 * @fileoverview Re-exports adapter-related types from the central types module.
 * Adapter implementations import from here for cleaner paths.
 */

export type {
  AdapterResult,
  Channel,
  Platform,
  PlatformAdapter,
  UniversalMessage,
} from "@/types/agent";
