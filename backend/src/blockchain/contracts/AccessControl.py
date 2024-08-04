from pyteal import *

def approval_program():
    on_creation = Seq([
        App.globalPut(Bytes("Creator"), Txn.sender()),
        Return(Int(1))
    ])

    is_creator = Txn.sender() == App.globalGet(Bytes("Creator"))

    grant_access = Seq([
        Assert(Txn.application_args.length() == Int(2)),
        App.localPut(Int(0), Concat(Bytes("access_"), Txn.application_args[1]), Int(1)),
        Return(Int(1))
    ])

    revoke_access = Seq([
        Assert(Txn.application_args.length() == Int(2)),
        App.localDel(Int(0), Concat(Bytes("access_"), Txn.application_args[1])),
        Return(Int(1))
    ])

    check_access = App.localGet(Int(0), Concat(Bytes("access_"), Txn.application_args[1]))

    program = Cond(
        [Txn.application_id() == Int(0), on_creation],
        [Txn.on_completion() == OnComplete.OptIn, Return(Int(1))],
        [Txn.application_args[0] == Bytes("grant_access"), grant_access],
        [Txn.application_args[0] == Bytes("revoke_access"), revoke_access],
        [Txn.application_args[0] == Bytes("check_access"), Return(check_access)]
    )

    return program

def clear_state_program():
    return Return(Int(1))

if __name__ == "__main__":
    with open("access_control_approval.teal", "w") as f:
        compiled = compileTeal(approval_program(), mode=Mode.Application, version=5)
        f.write(compiled)

    with open("access_control_clear.teal", "w") as f:
        compiled = compileTeal(clear_state_program(), mode=Mode.Application, version=5)
        f.write(compiled)