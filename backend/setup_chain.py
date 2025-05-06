"""Script to set up and initialize the MultiChain blockchain for certificate verification."""

import os
import subprocess
import time
import json
import requests
from django.conf import settings

CHAIN_NAME = 'certchain'
RPC_PORT = '4768'
RPC_USER = 'multichainrpc'
RPC_PASSWORD = 'your-rpc-password'  # Change this in production

def create_chain():
    """Create and initialize a new MultiChain blockchain."""
    try:
        # Create the chain
        subprocess.run([
            'multichain-util', 'create', CHAIN_NAME,
            '-anyone-can-connect=true',
            '-anyone-can-send=true',
            '-anyone-can-receive=true',
            '-anyone-can-create=true'
        ], check=True)
        
        # Start the blockchain
        subprocess.Popen(['multichaind', CHAIN_NAME, '-daemon'])
        
        # Wait for blockchain to start
        time.sleep(5)
        
        print(f"Chain '{CHAIN_NAME}' created and started successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error creating chain: {e}")
        return False

def initialize_streams():
    """Create streams for storing certificates."""
    try:
        # Create RPC connection
        url = f"http://localhost:{RPC_PORT}"
        headers = {'content-type': 'application/json'}
        
        def rpc_call(method, params=None):
            payload = {
                "method": method,
                "params": params or [],
                "jsonrpc": "2.0",
                "id": 1,
            }
            response = requests.post(
                url,
                data=json.dumps(payload),
                headers=headers,
                auth=(RPC_USER, RPC_PASSWORD)
            )
            return response.json()
        
        # Create certificates stream
        result = rpc_call('create', ['stream', 'certificates', True])
        if 'error' not in result:
            print("Created certificates stream")
            return True
        else:
            print(f"Error creating stream: {result['error']}")
            return False
            
    except Exception as e:
        print(f"Error initializing streams: {e}")
        return False

if __name__ == '__main__':
    if create_chain():
        if initialize_streams():
            print("Certificate verification blockchain setup completed successfully")
        else:
            print("Failed to initialize streams")
    else:
        print("Failed to create blockchain")
