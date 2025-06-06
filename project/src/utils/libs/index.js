

export function shortenAddress(address, chars = 4) {
    if (!address || address.length < 2 * chars + 2) return address;
    return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}
