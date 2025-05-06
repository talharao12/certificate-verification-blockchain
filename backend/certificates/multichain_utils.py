import json
import requests
from django.conf import settings

class MultichainClient:
    def __init__(self):
        self.rpcuser = settings.MULTICHAIN_RPC_USER
        self.rpcpassword = settings.MULTICHAIN_RPC_PASSWORD
        self.rpchost = settings.MULTICHAIN_RPC_HOST
        self.rpcport = settings.MULTICHAIN_RPC_PORT
        self.chain_name = settings.MULTICHAIN_CHAIN_NAME
        self.base_url = f"http://{self.rpchost}:{self.rpcport}"
        self.headers = {'content-type': 'application/json'}

    def _call_method(self, method, params=None):
        payload = {
            "method": method,
            "params": params or [],
            "jsonrpc": "2.0",
            "id": 1,
        }
        response = requests.post(
            self.base_url,
            data=json.dumps(payload),
            headers=self.headers,
            auth=(self.rpcuser, self.rpcpassword)
        )
        return response.json()

    def create_stream(self, stream_name):
        return self._call_method('create', ['stream', stream_name, True])

    def publish_certificate(self, stream_name, key, data):
        hex_data = json.dumps(data).encode('utf-8').hex()
        return self._call_method('publish', [stream_name, key, hex_data])

    def get_certificate(self, stream_name, key):
        items = self._call_method('liststreamkeyitems', [stream_name, key])
        if items.get('result'):
            latest_cert = items['result'][-1]
            hex_data = latest_cert['data']
            return json.loads(bytes.fromhex(hex_data).decode('utf-8'))
        return None

    def verify_certificate(self, stream_name, key, cert_hash):
        cert_data = self.get_certificate(stream_name, key)
        if cert_data and cert_data.get('hash') == cert_hash:
            return True
        return False
