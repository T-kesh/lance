import {
  StellarWalletsKit,
  Networks,
  type ISupportedWallet,
} from "@creit.tech/stellar-wallets-kit";

// TODO: See docs/ISSUES.md — "Wallet Connection"
let kit: StellarWalletsKit | null = null;

// Selected wallet id is captured from onWalletSelected and re-used for address
// retrieval / signing. Persisted in sessionStorage so a page refresh does not
// drop the provider identity while the wallet extension still holds the
// session.
const WALLET_ID_STORAGE_KEY = "lance:selected-wallet-id";

function readStoredWalletId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(WALLET_ID_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredWalletId(walletId: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (walletId) {
      window.sessionStorage.setItem(WALLET_ID_STORAGE_KEY, walletId);
    } else {
      window.sessionStorage.removeItem(WALLET_ID_STORAGE_KEY);
    }
  } catch {
    // ignore storage failures (private mode, etc.)
  }
}

export function getWalletsKit(): StellarWalletsKit {
  if (!kit) {
    const storedWalletId = readStoredWalletId();
    kit = new StellarWalletsKit({
      network:
        (process.env.NEXT_PUBLIC_STELLAR_NETWORK as Networks) ??
        Networks.TESTNET,
      selectedWalletId: storedWalletId ?? "freighter",
    });
  }
  return kit;
}

export interface ConnectedWallet {
  address: string;
  walletId: string;
  walletName: string;
  walletIcon: string;
}

/**
 * Opens the wallet-select modal and returns the connected public key.
 * Resolves once the user selects a wallet and the address is retrieved.
 */
export async function connectWallet(): Promise<string> {
  const wallet = await connectWalletWithInfo();
  return wallet.address;
}

/**
 * Same as connectWallet, but also returns the metadata of the selected
 * provider (id, display name, icon URL) so the UI can render it.
 */
export async function connectWalletWithInfo(): Promise<ConnectedWallet> {
  if (process.env.NEXT_PUBLIC_E2E === "true") {
    return {
      address: "GD...CLIENT",
      walletId: "freighter",
      walletName: "Freighter",
      walletIcon: "",
    };
  }
  const walletsKit = getWalletsKit();
  return new Promise<ConnectedWallet>((resolve, reject) => {
    walletsKit.openModal({
      onWalletSelected: async (option: ISupportedWallet) => {
        try {
          walletsKit.setWallet(option.id);
          writeStoredWalletId(option.id);
          walletsKit.closeModal();
          const { address } = await walletsKit.getAddress();
          resolve({
            address,
            walletId: option.id,
            walletName: option.name,
            walletIcon: option.icon,
          });
        } catch (err) {
          reject(err);
        }
      },
      onClosed: (err) => {
        if (err) reject(err);
      },
    });
  });
}

export async function getConnectedWalletAddress(): Promise<string | null> {
  if (process.env.NEXT_PUBLIC_E2E === "true") return "GD...CLIENT";
  try {
    const { address } = await getWalletsKit().getAddress();
    return address ?? null;
  } catch {
    return null;
  }
}

/**
 * Returns the id of the wallet provider the user previously selected, if any.
 * Reads from sessionStorage; does not query the extension.
 */
export function getSelectedWalletId(): string | null {
  return readStoredWalletId();
}

/**
 * Looks up metadata (display name, icon) for the given wallet id from the
 * kit's supported-wallets list. Returns null if the kit does not know it.
 */
export async function getWalletInfo(
  walletId: string,
): Promise<ISupportedWallet | null> {
  try {
    const wallets = await getWalletsKit().getSupportedWallets();
    return wallets.find((w) => w.id === walletId) ?? null;
  } catch {
    return null;
  }
}

/**
 * Clears the locally remembered provider selection.
 */
export function clearSelectedWallet(): void {
  writeStoredWalletId(null);
}

/**
 * Signs an XDR transaction string via the connected wallet.
 * Returns the signed XDR string ready for submission to the Soroban RPC.
 */
export async function signTransaction(xdr: string): Promise<string> {
  if (process.env.NEXT_PUBLIC_E2E === "true") return xdr;
  const walletsKit = getWalletsKit();
  const networkPassphrase =
    (process.env.NEXT_PUBLIC_STELLAR_NETWORK as Networks) ?? Networks.TESTNET;
  const { signedTxXdr } = await walletsKit.signTransaction(xdr, {
    networkPassphrase,
  });
  return signedTxXdr;
}
