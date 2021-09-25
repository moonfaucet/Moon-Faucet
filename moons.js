const { ethers } = require("ethers");

const provider = new ethers.providers.JsonRpcProvider('https://testnet.redditspace.com/rpc');
const signer = provider.getSigner();

const moons_contract_addr = "0x138fAFa28a05A38f4d2658b12b0971221A7d5728";
const moons_abi = [{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"who","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}];

let wallet = new ethers.Wallet(process.env.privkey);
wallet = wallet.connect(provider);
let moons = new ethers.Contract(moons_contract_addr, moons_abi, wallet);
//moons.balanceOf("0xAb7211621fc1c0594AC5825Cc27aed5034ffBDEb")
async function send_moons(addr, amount) {
  amount = ethers.utils.parseUnits(amount, 18);
  moons.transfer(addr, amount).then((transferResult) => {
    console.log(transferResult);
  });
}

async function check_bal_xdai(addr) {
  let raw = await provider.getBalance(addr);
  return ethers.utils.formatEther(raw);
}

async function check_bal_moons(addr) {
  let raw = await moons.balanceOf(addr);
  return ethers.utils.formatUnits(raw, 18);
}

async function faucet_dry(faucet_addr) {
  let faucet_bal = await check_bal_moons(faucet_addr);
  if (faucet_bal < 0.1) {
    return true;
  } 
  return false;
}

module.exports = {
  send_moons: send_moons,
  check_bal_xdai: check_bal_xdai,
  check_bal_moons: check_bal_moons,
  faucet_dry: faucet_dry
}