import os
import json
import requests
from django.conf import settings
from typing import Dict, Any, Optional

class MultichainClient:
    def __init__(self):
        self.host = os.getenv('MULTICHAIN_HOST', 'localhost')
        self.port = os.getenv('MULTICHAIN_PORT', '4768')
        self.rpc_user = os.getenv('MULTICHAIN_RPC_USER', 'multichainrpc')
        self.rpc_password = os.getenv('MULTICHAIN_RPC_PASSWORD', 'your-rpc-password')
        self.chain_name = os.getenv('MULTICHAIN_CHAIN_NAME', 'certchain')
        self.stream_name = os.getenv('MULTICHAIN_STREAM_NAME', 'certificates')
        self.url = f"http://{self.host}:{self.port}"
        self.headers = {'content-type': 'application/json'}
        print(f"Multichain Client initialized with URL: {self.url}")

    def _make_request(self, method: str, params: list) -> Dict[str, Any]:
        """Make a JSON-RPC request to the Multichain node."""
        payload = {
            "method": method,
            "params": params,
            "id": 1
        }
        
        try:
            print(f"Making request to {self.url} with method {method}")
            print(f"Request payload: {json.dumps(payload, indent=2)}")
            
            response = requests.post(
                self.url,
                data=json.dumps(payload),
                headers=self.headers,
                auth=(self.rpc_user, self.rpc_password),
                timeout=10
            )
            print(f"Response status code: {response.status_code}")
            print(f"Response text: {response.text}")
            
            if response.status_code != 200:
                error_msg = f"{response.status_code} {response.reason}"
                if response.text:
                    try:
                        error_data = response.json()
                        if 'error' in error_data and error_data['error']:
                            error_msg = f"{error_msg}: {error_data['error']}"
                    except:
                        error_msg = f"{error_msg}: {response.text}"
                return {"error": error_msg}
            
            try:
                result = response.json()
                print(f"Response JSON: {json.dumps(result, indent=2)}")
                
                if "error" in result and result["error"] is not None:
                    print(f"RPC Error: {result['error']}")
                    return {"error": result["error"]}
                    
                return result
            except json.JSONDecodeError as e:
                return {"error": f"Invalid JSON response: {str(e)}"}
                
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {str(e)}")
            return {"error": str(e)}

    def publish_certificate(self, stream: str, key: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Publish certificate data to the blockchain stream."""
        try:
            # Format data with json wrapper for Multichain
            formatted_data = {"json": data}
            
            # Use direct RPC call format
            payload = {
                "method": "publish",
                "params": [stream, key, formatted_data],
                "id": 1
            }
            
            print(f"Making direct RPC call to {self.url}")
            print(f"Request payload: {json.dumps(payload, indent=2)}")
            
            response = requests.post(
                self.url,
                data=json.dumps(payload),
                headers=self.headers,
                auth=(self.rpc_user, self.rpc_password),
                timeout=10
            )
            
            print(f"Response status code: {response.status_code}")
            print(f"Response text: {response.text}")
            
            if response.status_code != 200:
                error_msg = f"{response.status_code} {response.reason}"
                if response.text:
                    try:
                        error_data = response.json()
                        if 'error' in error_data and error_data['error']:
                            error_msg = f"{error_msg}: {error_data['error']}"
                    except:
                        error_msg = f"{error_msg}: {response.text}"
                return {"error": error_msg}
            
            try:
                result = response.json()
                print(f"Response JSON: {json.dumps(result, indent=2)}")
                
                if "error" in result and result["error"] is not None:
                    print(f"RPC Error: {result['error']}")
                    return {"error": result["error"]}
                    
                return {"result": result.get("result")}
            except json.JSONDecodeError as e:
                return {"error": f"Invalid JSON response: {str(e)}"}
                
        except Exception as e:
            print(f"Error in publish_certificate: {str(e)}")
            return {"error": str(e)}

    def get_certificate(self, stream: str, key: str) -> Optional[Dict[str, Any]]:
        """Retrieve certificate data from the blockchain stream."""
        try:
            # Use direct RPC call format
            payload = {
                "method": "liststreamkeyitems",
                "params": [stream, key],
                "id": 1
            }
            
            print(f"Making direct RPC call to {self.url}")
            print(f"Request payload: {json.dumps(payload, indent=2)}")
            
            response = requests.post(
                self.url,
                data=json.dumps(payload),
                headers=self.headers,
                auth=(self.rpc_user, self.rpc_password),
                timeout=10
            )
            
            print(f"Response status code: {response.status_code}")
            print(f"Response text: {response.text}")
            
            if response.status_code != 200:
                print(f"Error response: {response.status_code} {response.reason}")
                return None
            
            try:
                result = response.json()
                print(f"Response JSON: {json.dumps(result, indent=2)}")
                
                if "error" in result and result["error"] is not None:
                    print(f"RPC Error: {result['error']}")
                    return None
                
                items = result.get("result", [])
                if not items:
                    print("No items found in stream")
                    return None
                
                # Get the most recent item
                latest_item = items[-1]
                try:
                    # Extract data from the json wrapper
                    data = latest_item.get("data", {}).get("json", {})
                    if isinstance(data, str):
                        data = json.loads(data)
                    print("Extracted blockchain data:", json.dumps(data, indent=2))
                    
                    # Ensure all required fields are present
                    required_fields = ['student_name', 'student_id', 'course', 'grade', 'certificate_id']
                    for field in required_fields:
                        if field not in data:
                            print(f"Missing required field: {field}")
                            return None
                    
                    return data
                except json.JSONDecodeError as e:
                    print(f"Error decoding JSON data: {str(e)}")
                    return None
            except json.JSONDecodeError as e:
                print(f"Error decoding response JSON: {str(e)}")
                return None
                
        except Exception as e:
            print(f"Error in get_certificate: {str(e)}")
            return None

    def verify_certificate(self, stream: str, key: str, data: Dict[str, Any]) -> bool:
        """Verify if the certificate data matches what's stored on the blockchain."""
        stored_data = self.get_certificate(stream, key)
        if not stored_data:
            return False
            
        # Compare the stored data with the provided data
        return stored_data == data

    def create_stream(self, stream_name: str) -> Dict[str, Any]:
        """Create a new stream in the blockchain."""
        return self._make_request("create", ["stream", stream_name, True])

    def subscribe_to_stream(self, stream_name: str) -> Dict[str, Any]:
        """Subscribe to a stream to receive updates."""
        return self._make_request("subscribe", [stream_name])

    def get_stream_info(self, stream_name: str) -> Dict[str, Any]:
        """Get information about a stream."""
        return self._make_request("getstreaminfo", [stream_name])

    def add_certificate(self, certificate):
        """Add a certificate to the blockchain."""
        try:
            # Get certificate data and set status to ISSUED
            data = certificate.get_blockchain_data()
            data['status'] = 'ISSUED'  # Set status to ISSUED before publishing
            
            # Publish to blockchain
            result = self.publish_certificate(
                self.stream_name,
                certificate.certificate_id,
                data
            )
            
            if 'error' in result:
                raise Exception(result['error'])
                
            # Update certificate with blockchain transaction ID
            certificate.blockchain_tx = result.get('result', '')
            certificate.status = 'ISSUED'
            certificate.save()
            
            return result
        except Exception as e:
            print(f"Error adding certificate to blockchain: {str(e)}")
            raise

    def list_certificates(self) -> list:
        """List all certificates from the blockchain stream."""
        try:
            # Use direct RPC call format
            payload = {
                "method": "liststreamitems",
                "params": [self.stream_name],
                "id": 1
            }
            
            print(f"Making direct RPC call to {self.url}")
            print(f"Request payload: {json.dumps(payload, indent=2)}")
            
            response = requests.post(
                self.url,
                data=json.dumps(payload),
                headers=self.headers,
                auth=(self.rpc_user, self.rpc_password),
                timeout=10
            )
            
            print(f"Response status code: {response.status_code}")
            print(f"Response text: {response.text}")
            
            if response.status_code != 200:
                error_msg = f"{response.status_code} {response.reason}"
                if response.text:
                    try:
                        error_data = response.json()
                        if 'error' in error_data and error_data['error']:
                            error_msg = f"{error_msg}: {error_data['error']}"
                    except:
                        error_msg = f"{error_msg}: {response.text}"
                raise Exception(error_msg)
            
            try:
                result = response.json()
                print(f"Response JSON: {json.dumps(result, indent=2)}")
                
                if "error" in result and result["error"] is not None:
                    print(f"RPC Error: {result['error']}")
                    raise Exception(result["error"])
                
                items = result.get("result", [])
                certificates = []
                
                for item in items:
                    try:
                        # Extract data from the json wrapper
                        data = item.get("data", {}).get("json", {})
                        if isinstance(data, str):
                            data = json.loads(data)
                        certificates.append(data)
                    except json.JSONDecodeError as e:
                        print(f"Error decoding JSON data: {str(e)}")
                        continue
                
                return certificates
            except json.JSONDecodeError as e:
                raise Exception(f"Invalid JSON response: {str(e)}")
                
        except Exception as e:
            print(f"Error in list_certificates: {str(e)}")
            raise
