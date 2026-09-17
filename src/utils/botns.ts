/**
 * BotNS Identity Resolution Abstraction
 * Formats wallet addresses safely or resolves future .bot domains.
 */
export function formatAddress(address?: string | null): string {
  if (!address) return "";
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export async function resolveIdentity(address?: string | null): Promise<string> {
  if (!address) return "";
  // Future BotNS registry lookup hook:
  // When BotNS registry is live on Botchain, we will resolve here.
  // Currently returns cleanly shortened checksum address.
  return formatAddress(address);
}
