import { Connection, Keypair, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import bs58 from 'bs58';

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

let platformWallet: Keypair | null = null;

// Initialize platform wallet from environment variable
export function initializePlatformWallet() {
  const privateKeyBase58 = process.env.PLATFORM_WALLET_PRIVATE_KEY;
  
  if (!privateKeyBase58) {
    console.warn('⚠️  PLATFORM_WALLET_PRIVATE_KEY not set. Payouts will be simulated.');
    return false;
  }

  try {
    const privateKeyBytes = bs58.decode(privateKeyBase58);
    platformWallet = Keypair.fromSecretKey(privateKeyBytes);
    console.log('✅ Platform wallet initialized:', platformWallet.publicKey.toString());
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize platform wallet:', error);
    return false;
  }
}

// Send SOL to a worker's wallet
export async function sendPayout(
  workerAddress: string,
  lamports: number
): Promise<{ success: boolean; signature?: string; error?: string }> {
  
  if (!platformWallet) {
    return {
      success: false,
      error: 'Platform wallet not initialized'
    };
  }

  try {
    const recipientPublicKey = new PublicKey(workerAddress);
    
    // Check platform wallet balance
    const balance = await connection.getBalance(platformWallet.publicKey);
    console.log(`Platform wallet balance: ${balance / 1e9} SOL`);
    
    if (balance < lamports) {
      return {
        success: false,
        error: `Insufficient funds in platform wallet. Required: ${lamports / 1e9} SOL, Available: ${balance / 1e9} SOL`
      };
    }

    // Create transfer transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: platformWallet.publicKey,
        toPubkey: recipientPublicKey,
        lamports: lamports,
      })
    );

    // Send and confirm transaction
    console.log(`Sending ${lamports / 1e9} SOL to ${workerAddress}...`);
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [platformWallet],
      {
        commitment: 'confirmed',
      }
    );

    console.log(`✅ Payout successful! Signature: ${signature}`);
    
    return {
      success: true,
      signature: signature
    };

  } catch (error: any) {
    console.error('❌ Payout failed:', error);
    return {
      success: false,
      error: error.message || 'Transaction failed'
    };
  }
}

// Get platform wallet balance
export async function getPlatformWalletBalance(): Promise<number> {
  if (!platformWallet) {
    return 0;
  }
  
  try {
    const balance = await connection.getBalance(platformWallet.publicKey);
    return balance / 1e9; // Convert to SOL
  } catch (error) {
    console.error('Error fetching platform wallet balance:', error);
    return 0;
  }
}

// Get platform wallet public key
export function getPlatformWalletAddress(): string | null {
  return platformWallet ? platformWallet.publicKey.toString() : null;
}
