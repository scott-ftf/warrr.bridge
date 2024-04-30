#!/usr/bin/env python3
from solcx import compile_standard, install_solc
import json
from web3 import Web3
from web3.middleware import geth_poa_middleware

# pip install py-solc-x web3
ADDERESS_PRIVATE_KEY = "private_key"
INFURA_PROJECT_ID = "infura_project_id"

# Specify the Solidity source code
with open('WarrrClaim.sol', 'r') as file:
    solc_code = file.read()

# Install the required Solidity compiler version
install_solc('0.8.0')

# Compile the contract
compiled_sol = compile_standard({
    "language": "Solidity",
    "sources": {"WarrrClaim.sol": {"content": solc_code}},
    "settings": {
        "outputSelection": {
            "*": {
                "*": ["abi", "metadata", "evm.bytecode", "evm.bytecode.sourceMap"]
            }
        }
    },
    "solc_version": "0.8.0",
})

# Save the ABI and bytecode for deployment
abi = compiled_sol['contracts']['WarrrClaim.sol']['WarrrTransferRecorder']['abi']
bytecode = compiled_sol['contracts']['WarrrClaim.sol']['WarrrTransferRecorder']['evm']['bytecode']['object']

# Connect to Ethereum node (Infura)
infura_url = f'https://mainnet.infura.io/v3/{INFURA_PROJECT_ID}'
web3 = Web3(Web3.HTTPProvider(infura_url))
web3.middleware_onion.inject(geth_poa_middleware, layer=0)

# Set up your wallet
account = web3.eth.account.from_key(ADDERESS_PRIVATE_KEY)
web3.eth.default_account = account.address

# Create the contract in Python
Contract = web3.eth.contract(abi=abi, bytecode=bytecode)

# Build transaction
construct_txn = Contract.constructor().buildTransaction({
    'from': account.address,
    'nonce': web3.eth.getTransactionCount(account.address),
    'gas': 2000000,
    'gasPrice': web3.toWei('50', 'gwei')
})

# Sign the transaction
signed = account.sign_transaction(construct_txn)

# Send the transaction
tx_hash = web3.eth.sendRawTransaction(signed.rawTransaction)

# Wait for the transaction to be mined
tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)

print(f"Contract Deployed At: {tx_receipt.contractAddress}")
