from algosdk.v2client import algod

# Connect to Algorand Sandbox
algod_address = "http://localhost:4001"
algod_token = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
client = algod.AlgodClient(algod_token, algod_address)

try:
    status = client.status()
    print(f"Algorand network status: {status}")
except Exception as e:
    print(f"Error connecting to Algorand network: {e}")