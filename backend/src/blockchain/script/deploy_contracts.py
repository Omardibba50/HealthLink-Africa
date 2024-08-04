import json
import os
import base64
from algosdk import account, mnemonic
from algosdk.v2client import algod
from algosdk import transaction

# Replace with your actual Algorand API token
ALGOD_TOKEN = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
ALGOD_ADDRESS = "http://localhost:4001"
HEADERS = {
    "X-API-Key": ALGOD_TOKEN,
}

algod_client = algod.AlgodClient(ALGOD_TOKEN, ALGOD_ADDRESS, headers=HEADERS)

def compile_program(client, source_code):
    compile_response = client.compile(source_code)
    return base64.b64decode(compile_response['result'])

def deploy_contract(approval_program, clear_program, global_schema, local_schema):
    try:
        params = algod_client.suggested_params()
        
        # Compile the approval and clear programs
        approval_program = compile_program(algod_client, approval_program)
        clear_program = compile_program(algod_client, clear_program)
        
        txn = transaction.ApplicationCreateTxn(
            sender=sender,
            sp=params,
            on_complete=transaction.OnComplete.NoOpOC,
            approval_program=approval_program,
            clear_program=clear_program,
            global_schema=global_schema,
            local_schema=local_schema
        )
        
        signed_txn = txn.sign(private_key)
        tx_id = algod_client.send_transaction(signed_txn)
        
        # Wait for the transaction to be confirmed
        transaction_response = transaction.wait_for_confirmation(algod_client, tx_id, 4)
        app_id = transaction_response['application-index']
        return app_id
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return None

if __name__ == "__main__":
    # Replace with your actual Algorand account address and private key
    sender = "DQ4WDJZUJT73RLNLJTDQWHKMH74BTGWU6ESLHNIN3UHJQY4XSK74ZXAOVQ"
    private_key = mnemonic.to_private_key("pond file source divorce reunion mosquito denial depend buffalo essay monkey napkin monitor rent merit scorpion wish program off prevent tray regular hidden abstract basic")

    # Ensure these paths are correct
    with open("../../contracts/health_record_manager_approval.teal", "r") as f:
        approval_program = f.read()
    with open("../../contracts/health_record_manager_clear.teal", "r") as f:
        clear_program = f.read()

    global_schema = transaction.StateSchema(num_uints=1, num_byte_slices=1)
    local_schema = transaction.StateSchema(num_uints=1, num_byte_slices=1)

    app_id = deploy_contract(approval_program, clear_program, global_schema, local_schema)
    
    if app_id:
        print(f"Deployed contract with app_id: {app_id}")
        with open("app_ids.json", "w") as f:
            json.dump({"health_record_manager_app_id": app_id}, f)
    else:
        print("Failed to deploy the contract.")