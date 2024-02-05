const ethers = require('ethers');
const ABI = require("./out/Sandwich.sol/Sandwich.json").abi;

const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

const calcNextBlockBaseFee = (curBlock) => {
    const baseFee = curBlock.baseFeePerGas;
    const gasUsed = curBlock.gasUsed;
    const targetGasUsed = curBlock.gasLimit.div(2);
    const delta = gasUsed.sub(targetGasUsed);

    const newBaseFee = baseFee.add(
        baseFee.mul(delta).div(targetGasUsed).div(ethers.BigNumber.from(8))
    );

    // Add 0-9 wei so it becomes a different hash each time
    const rand = Math.floor(Math.random() * 10);
    return newBaseFee.add(rand);
};

async function main() {
    // referenced: https://github.com/libevm/subway/blob/master/bot/index.js

    // public, private key generated from Anvil
    const PUBLIC = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
    const PRIVATE = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

    const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545'); // Anvil RPC
    const wallet = new ethers.Wallet(PRIVATE, provider);
    const { chainId } = await provider.getNetwork();

    const sandwich = new ethers.Contract(contractAddress, ABI, wallet);
    
    // before call
    let x = await sandwich.x();
    console.log(`Before: ${x.toString()}`);

    // send transaction
    const block = await provider.getBlock();
    const nextBaseFee = calcNextBlockBaseFee(block);
    const nonce = await wallet.getTransactionCount();
    // you don't need a function signature to call fallback function
    const payload = ethers.utils.solidityPack(
        ['uint256'],
        [280]
    );
    console.log(payload);
    const tx = {
        to: contractAddress,
        from: PUBLIC,
        data: payload,
        chainId,
        maxPriorityFeePerGas: 0,
        maxFeePerGas: nextBaseFee,
        gasLimit: 250000,
        nonce,
        type: 2,
    };
    const signed = await wallet.signTransaction(tx);
    const res = await provider.sendTransaction(signed);
    const receipt = await provider.getTransactionReceipt(res.hash);
    console.log(receipt.gasUsed.toString());

    // after call
    x = await sandwich.x();
    console.log(`After: ${x.toString()}`);
}

(async () => {
    await main();
})();