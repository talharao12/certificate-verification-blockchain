# Certificate Verification System

A blockchain-based certificate verification system that allows educational institutions to issue and verify academic certificates using Multichain blockchain technology.

## Tech Stack

### Backend
- Python 3.8+
- Django 4.2
- Django REST Framework
- Multichain (Blockchain)
- JWT Authentication
- PostgreSQL

### Frontend
- React 18
- TypeScript
- Material-UI (MUI)
- Axios
- React Router
- React Query

## Prerequisites

1. Python 3.8 or higher
2. Node.js 16 or higher
3. PostgreSQL
4. Multichain node (already set up)

## Environment Variables

### Backend (.env)
```env
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:password@localhost:5432/certificate_db
MULTICHAIN_HOST=localhost
MULTICHAIN_PORT=4768
MULTICHAIN_RPC_USER=multichainrpc
MULTICHAIN_RPC_PASSWORD=your-rpc-password
MULTICHAIN_CHAIN_NAME=certchain
MULTICHAIN_STREAM_NAME=certificates
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:8000
```

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd certificate_verification
```

### 2. Backend Setup

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
cd backend
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run the development server
python manage.py runserver
```

### 3. Frontend Setup

```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm start
```

## Multichain Setup

The system is already configured to work with an existing Multichain node. The following settings are used:

- Host: localhost
- Port: 4768
- RPC User: multichainrpc
- Chain Name: certchain
- Stream Name: certificates

## API Endpoints

### Authentication
- `POST /api/token/` - Get JWT token
- `POST /api/token/refresh/` - Refresh JWT token

### Certificates
- `POST /api/certificates` - Create new certificate
- `GET /api/certificates` - List all certificates
- `GET /api/certificates/{id}` - Get certificate details
- `POST /api/certificates/verify` - Verify certificate
- `GET /api/certificates/list_all_blockchain` - List all certificates from blockchain

### Institutions
- `GET /api/institutions` - List all institutions
- `POST /api/institutions` - Create new institution

## Testing the System

### 1. Create an Institution
1. Log in to the admin panel (http://localhost:8000/admin)
2. Create a new institution
3. Note down the institution ID

### 2. Issue a Certificate
1. Log in to the frontend application
2. Navigate to "Issue Certificate"
3. Fill in the certificate details:
   - Student Name
   - Student ID
   - Course
   - Grade
   - Issue Date
4. Submit the form

### 3. Verify a Certificate
1. Navigate to "Verify Certificate"
2. Enter the certificate ID
3. Click "Verify"

### 4. View Blockchain Data
1. Navigate to "Certificate List"
2. All certificates will be displayed with their blockchain status

## Project Structure

```
certificate_verification/
├── backend/
│   ├── certificates/
│   │   ├── models.py         # Database models
│   │   ├── views.py          # API views
│   │   ├── serializers.py    # Data serializers
│   │   ├── urls.py           # URL routing
│   │   └── multichain_utils.py  # Blockchain integration
│   ├── core/
│   │   ├── settings.py       # Django settings
│   │   └── urls.py           # Main URL configuration
│   └── manage.py
└── frontend/
    ├── src/
    │   ├── components/       # React components
    │   ├── pages/           # Page components
    │   ├── context/         # React context
    │   └── App.tsx          # Main application component
    └── package.json
```

## Key Features

1. **Blockchain Integration**
   - Certificates are stored on Multichain blockchain
   - Each certificate has a unique ID
   - Immutable record of all certificates

2. **Authentication**
   - JWT-based authentication
   - Role-based access control
   - Secure API endpoints

3. **Certificate Management**
   - Create new certificates
   - Verify certificate authenticity
   - View certificate history
   - Export certificate data

4. **User Roles**
   - Institution Admin
   - Certificate Issuer
   - Certificate Verifier

## Troubleshooting

### Common Issues

1. **Blockchain Connection Error**
   - Check if Multichain node is running
   - Verify environment variables
   - Check RPC credentials

2. **Database Connection Error**
   - Verify PostgreSQL is running
   - Check database credentials
   - Ensure migrations are applied

3. **Frontend API Connection Error**
   - Check if backend server is running
   - Verify API URL in frontend .env
   - Check CORS settings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
