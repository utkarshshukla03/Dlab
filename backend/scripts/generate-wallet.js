/**
 * Script to generate or display Solana wallet for platform payouts
 * 
 * Usage:
 * node scripts/generate-wallet.js
 */

const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58').default || require('bs58');

console.log('\n🔑 Solana Wallet Generator for DLab Platform\n');

// Generate a new keypair
const keypair = Keypair.generate();

// Get the public key (wallet address)
const publicKey = keypair.publicKey.toString();

// Get the private key in base58 format
const privateKeyBase58 = bs58.encode(keypair.secretKey);

console.log('✅ New wallet generated!\n');
console.log('Public Key (Wallet Address):');
console.log(publicKey);
console.log('\nPrivate Key (Base58 - KEEP SECRET!):');
console.log(privateKeyBase58);
console.log('\n⚠️  IMPORTANT:');
console.log('1. Add this to your .env file:');
console.log(`   PLATFORM_WALLET_PRIVATE_KEY=${privateKeyBase58}`);
console.log('\n2. Fund this wallet with SOL on devnet:');
console.log(`   Visit: https://faucet.solana.com/`);
console.log(`   Or use: solana airdrop 2 ${publicKey} --url devnet`);
console.log('\n3. NEVER share the private key with anyone!');
console.log('4. For production, use mainnet and store the private key securely.\n');
