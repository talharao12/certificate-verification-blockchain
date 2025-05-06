# Certificate Verification System with Blockchain

This project implements a secure certificate verification system using Multichain blockchain technology. It allows institutions to issue digital certificates that can be independently verified by anyone.

## Features

- Issue digital certificates with unique identifiers
- Store certificate data securely on the blockchain
- Verify certificates using blockchain data
- View all certificates stored on the blockchain
- Modern web interface for certificate management and verification

## Technology Stack

- Backend: Django REST Framework
- Frontend: React with Chakra UI
- Blockchain: Multichain
- Database: PostgreSQL

## Prerequisites

- Python 3.8+
- Node.js 14+
- Multichain 2.3.3+
- PostgreSQL

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd certificate_verification
```

2. Set up Multichain:
```bash
# Install Multichain
wget https://www.multichain.com/download/multichain-2.3.3.tar.gz
tar -xvzf multichain-2.3.3.tar.gz
cd multichain-2.3.3
mv multichaind multichain-cli multichain-util /usr/local/bin

# Create and initialize the blockchain
multichain-util create certchain
multichaind certchain -daemon
```

3. Set up the backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

4. Set up the frontend:
```bash
cd frontend
npm install
npm start
```

## Blockchain Verification Commands

You can verify that certificates are actually stored on the blockchain using these commands:

1. List all certificates on the blockchain:
```bash
multichain-cli certchain liststreamitems certificates
```

2. Verify a specific certificate:
```bash
multichain-cli certchain liststreamkeyitems certificates <certificate-id>
```

3. Check blockchain status:
```bash
multichain-cli certchain getinfo
```

## API Endpoints

- `POST /api/certificates/`: Create a new certificate
- `POST /api/certificates/verify/`: Verify a certificate
- `GET /api/certificates/list_all_blockchain/`: Get all certificates from blockchain
- `POST /api/certificates/{id}/revoke/`: Revoke a certificate

## Example: Creating and Verifying a Certificate

1. Create a certificate:
```bash
curl -X POST http://localhost:8000/api/certificates/ \
  -H "Content-Type: application/json" \
  -d '{
    "student_name": "John Doe",
    "student_id": "2023-001",
    "course": "Blockchain Technology",
    "grade": "A",
    "issue_date": "2025-05-07",
    "institution": 1
  }'
```

2. Verify the certificate using the API:
```bash
curl -X POST http://localhost:8000/api/certificates/verify/ \
  -H "Content-Type: application/json" \
  -d '{
    "certificate_id": "<certificate-id>"
  }'
```

3. Verify directly on the blockchain:
```bash
multichain-cli certchain liststreamkeyitems certificates <certificate-id>
```

## Security Features

- Each certificate has a unique hash ID generated using student details and timestamp
- All blockchain operations are signed and verified
- Certificates can be revoked if needed
- All operations are logged and traceable

## Blockchain Data Structure

Each certificate on the blockchain contains:
- Certificate ID (unique hash)
- Student details (name, ID, email)
- Course information
- Grade
- Issue date
- Institution details
- Status (DRAFT/ISSUED/REVOKED)
- Metadata
- Transaction ID
- Publisher address
- Confirmations

## Troubleshooting

1. If Multichain connection fails:
```bash
# Check if Multichain daemon is running
ps aux | grep multichaind

# Restart Multichain daemon
multichaind certchain -daemon
```

2. Check Multichain permissions:
```bash
multichain-cli certchain listpermissions
```

3. View Multichain logs:
```bash
tail -f ~/.multichain/certchain/debug.log
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
