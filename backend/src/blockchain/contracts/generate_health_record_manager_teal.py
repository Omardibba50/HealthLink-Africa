from pyteal import *
import os

def approval_program():
    on_creation = Seq([
        App.globalPut(Bytes("Creator"), Txn.sender()),
        Return(Int(1))
    ])

    is_creator = Txn.sender() == App.globalGet(Bytes("Creator"))

    add_record = Seq([
        Assert(Txn.application_args.length() == Int(2)),  # Ensure only 2 arguments are expected
        App.localPut(Int(0), Txn.application_args[1], Txn.sender()),  # Store sender instead of third arg
        Return(Int(1))
    ])

    get_record = App.localGet(Int(0), Txn.application_args[1])

    program = Cond(
        [Txn.application_id() == Int(0), on_creation],
        [Txn.on_completion() == OnComplete.OptIn, Return(Int(1))],
        [Txn.application_args[0] == Bytes("add_record"), add_record],
        [Txn.application_args[0] == Bytes("get_record"), Return(get_record)]
    )

    return program

def clear_state_program():
    return Return(Int(1))

if __name__ == "__main__":
    os.makedirs("../../contracts", exist_ok=True)
    
    with open("../../contracts/health_record_manager_approval.teal", "w") as f:
        compiled = compileTeal(approval_program(), mode=Mode.Application, version=5)
        f.write(compiled)

    with open("../../contracts/health_record_manager_clear.teal", "w") as f:
        compiled = compileTeal(clear_state_program(), mode=Mode.Application, version=5)
        f.write(compiled)