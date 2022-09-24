// Import Solana web3 functinalities
const {
	Connection,
	PublicKey,
	clusterApiUrl,
	Keypair,
	LAMPORTS_PER_SOL,
	Transaction,
	SystemProgram,
	sendAndConfirmRawTransaction,
	sendAndConfirmTransaction,
} = require("@solana/web3.js");

const DEMO_FROM_SECRET_KEY = new Uint8Array([
	234, 161, 235, 19, 121, 50, 58, 88, 203, 112, 38, 142, 164, 130, 206, 214,
	103, 227, 114, 92, 169, 232, 107, 78, 65, 255, 188, 6, 67, 119, 7, 115, 140,
	81, 154, 82, 224, 195, 46, 213, 100, 200, 170, 88, 75, 38, 48, 205, 201, 70,
	123, 163, 152, 237, 6, 106, 157, 59, 129, 126, 45, 158, 39, 126,
]);

// create wallet
const generateWallet = async () => {
	const from = Keypair.generate();
	console.log(from);
};

// check both balances
const getWalletBalances = async (fromPubkey, toPubkey) => {
	const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

	const fromWalletBalance = await connection.getBalance(
		new PublicKey(fromPubkey)
	);
	const toWalletBalance = await connection.getBalance(new PublicKey(toPubkey));
	console.log(
		`From Wallet balance: ${
			parseInt(fromWalletBalance) / LAMPORTS_PER_SOL
		} SOL\n`,
		`To Wallet balance: ${parseInt(toWalletBalance) / LAMPORTS_PER_SOL} SOL`
	);
};

// check balance
const getWalletBalance = async (pubkey) => {
	const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

	const walletBalance = await connection.getBalance(new PublicKey(pubkey));
	console.log(
		`Wallet balance: ${parseInt(walletBalance) / LAMPORTS_PER_SOL} SOL`
	);
	return walletBalance;
};

const transferSol = async () => {
	const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

	// Get Keypair from Secret Key
	var from = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);

	// Other things to try:
	// 1) Form array from userSecretKey
	// const from = Keypair.fromSecretKey(Uint8Array.from(userSecretKey));
	// 2) Make a new Keypair (starts with 0 SOL)
	// const from = Keypair.generate();

	// Generate another Keypair (account we'll be sending to)
	const to = Keypair.generate();
	await getWalletBalances(from.publicKey, to.publicKey);

	// Aidrop 2 SOL to Sender wallet
	console.log("Airdopping some SOL to Sender wallet!");
	const fromAirDropSignature = await connection.requestAirdrop(
		new PublicKey(from.publicKey),
		2 * LAMPORTS_PER_SOL
	);

	// Latest blockhash (unique identifer of the block) of the cluster
	let latestBlockHash = await connection.getLatestBlockhash();

	// Confirm transaction using the last valid block height (refers to its time)
	// to check for transaction expiration
	await connection.confirmTransaction({
		blockhash: latestBlockHash.blockhash,
		lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
		signature: fromAirDropSignature,
	});

	console.log("Airdrop completed for the Sender account");
	const solBalance = await getWalletBalance(from.publicKey);

	// Send money from "from" wallet and into "to" wallet
	var transaction = new Transaction().add(
		SystemProgram.transfer({
			fromPubkey: from.publicKey,
			toPubkey: to.publicKey,
			lamports: solBalance / 2,
		})
	);

	// Sign transaction
	var signature = await sendAndConfirmTransaction(connection, transaction, [
		from,
	]);
	console.log("Signature is ", signature);
	await getWalletBalances(from.publicKey, to.publicKey);
};

// generateWallet();
transferSol();
