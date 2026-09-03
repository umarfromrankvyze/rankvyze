import "server-only";
import { dodoConfigured, dodoProvider } from "./dodo";
import { devProvider } from "./dev";
import type { PaymentProvider } from "./provider";

/** Dodo when its credentials exist, otherwise the clearly-labelled test provider. */
export function paymentProvider(): PaymentProvider {
  return dodoConfigured() ? dodoProvider : devProvider;
}

export function paymentsAreLive() {
  return dodoConfigured();
}

export * from "./provider";
