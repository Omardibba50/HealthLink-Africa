from algosdk import account, mnemonic
from algosdk.v2client import algod
from algosdk.transaction import PaymentTxn, AssetConfigTxn, wait_for_confirmation
import os

# Connect to Algorand Sandbox
algod_address = "http://localhost:4001"
algod_token = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
algod_client = algod.AlgodClient(algod_token, algod_address)

# Use a funded account from Algorand Sandbox
# Replace this with a mnemonic from your Sandbox
funded_account_mnemonic = "lizard mercy chicken ivory awful palm army float child goddess volume vague close sun title cement cruel note quantum barrel chef wife rather above intact"
funded_account_private_key = mnemonic.to_private_key(funded_account_mnemonic)
funded_account_address = account.address_from_private_key(funded_account_private_key)

def get_account_balance(address):
    account_info = algod_client.account_info(address)
    return account_info.get('amount')

def fund_account(receiver_address, amount):
    sender_balance = get_account_balance(funded_account_address)
    if sender_balance < amount + 1000:  # 1000 microAlgos for transaction fee
        print(f"Insufficient balance to fund {receiver_address}. Current balance: {sender_balance} microAlgos")
        return False

    params = algod_client.suggested_params()
    txn = PaymentTxn(
        sender=funded_account_address,
        sp=params,
        receiver=receiver_address,
        amt=amount
    )
    signed_txn = txn.sign(funded_account_private_key)
    try:
        tx_id = algod_client.send_transaction(signed_txn)
        wait_for_confirmation(algod_client, tx_id, 4)
        print(f"Funded account {receiver_address} with {amount} microAlgos")
        return True
    except Exception as e:
        print(f"Error funding account {receiver_address}: {str(e)}")
        return False

def create_asset(creator_private_key):
    params = algod_client.suggested_params()
    txn = AssetConfigTxn(
        sender=account.address_from_private_key(creator_private_key),
        sp=params,
        total=1000000000,  # Total supply
        default_frozen=False,
        unit_name="HLLA",
        asset_name="HealthLink Africa Token",
        manager=account.address_from_private_key(creator_private_key),
        reserve=account.address_from_private_key(creator_private_key),
        freeze=account.address_from_private_key(creator_private_key),
        clawback=account.address_from_private_key(creator_private_key),
        decimals=0
    )
    signed_txn = txn.sign(creator_private_key)
    try:
        tx_id = algod_client.send_transaction(signed_txn)
        confirmed_txn = wait_for_confirmation(algod_client, tx_id, 4)
        return confirmed_txn['asset-index']
    except Exception as e:
        print(f"Error creating asset: {str(e)}")
        return None

def main():
    initial_balance = get_account_balance(funded_account_address)
    print(f"Funded account balance: {initial_balance} microAlgos")

    # Generate admin account
    admin_private_key, admin_address = account.generate_account()
    admin_mnemonic = mnemonic.from_private_key(admin_private_key)
    print(f"ADMIN_ADDRESS={admin_address}")
    print(f"ADMIN_MNEMONIC={admin_mnemonic}")

    # Generate other accounts
    accounts = {
        "PATIENT": account.generate_account(),
        "DOCTOR": account.generate_account(),
        "HEALTH_RECORD_MANAGER": account.generate_account(),
        "ACCESS_CONTROL": account.generate_account()
    }

    for name, (private_key, address) in accounts.items():
        print(f"{name}_ADDRESS={address}")
        print(f"{name}_MNEMONIC={mnemonic.from_private_key(private_key)}")

    # Fund accounts with reduced amounts
    funding_amounts = {
        admin_address: 300000,
        accounts["HEALTH_RECORD_MANAGER"][1]: 200000,
        accounts["ACCESS_CONTROL"][1]: 200000
    }

    for address, amount in funding_amounts.items():
        if not fund_account(address, amount):
            print(f"Warning: Failed to fund {address}")

    # Create HLLA asset
    admin_balance = get_account_balance(admin_address)
    if admin_balance >= 100000:  # Minimum balance to create an asset
        hlla_asset_id = create_asset(admin_private_key)
        if hlla_asset_id:
            print(f"HLLA_ASSET_ID={hlla_asset_id}")
        else:
            print("Failed to create HLLA asset")
    else:
        print("Insufficient balance to create HLLA asset")

    # Print other necessary environment variables
    print(f"ALGOD_TOKEN={algod_token}")
    print(f"ALGOD_SERVER={algod_address}")
    print("ALGOD_PORT=4001")
    print("MONGO_URI=mongodb://localhost:27017/healthlink_africa")
    print("JWT_SECRET=sQrwzQKWwqndfiwZoN/VNZPrcFOlEz+OqKfkkIGPg1Q=")
    print("PORT=5000")
    print("FRONTEND_URL=http://localhost:3000")

    final_balance = get_account_balance(funded_account_address)
    print(f"Remaining funded account balance: {final_balance} microAlgos")

if __name__ == "__main__":
    main()