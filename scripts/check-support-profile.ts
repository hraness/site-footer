import type { SupportProfile as FoundationProfile } from "@hraness/support-foundation";
import type { SupportProfile as FooterProfile } from "../src/internal.js";

// Declaration consumers must not need a second Git dependency. Keep the local
// public shape exactly equal to the reviewed, build-time foundation contract.
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2) ? true : false;
type Assert<T extends true> = T;
export type CheckedSupportProfile = Assert<Equal<FoundationProfile, FooterProfile>>;
