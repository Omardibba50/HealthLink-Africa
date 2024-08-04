import os
import subprocess

def compile_teal(teal_file):
    result = subprocess.run(['goal', 'clerk', 'compile', teal_file], capture_output=True, text=True)
    return result.stdout.strip()

if __name__ == "__main__":
    teal_files = [
        "../../contracts/access_control_approval.teal",
        "../../contracts/access_control_clear.teal",
        "../../contracts/health_record_manager_approval.teal",
        "../../contracts/health_record_manager_clear.teal"
    ]
    
    for teal_file in teal_files:
        compiled = compile_teal(teal_file)
        print(f"Compiled {teal_file}: {compiled}")