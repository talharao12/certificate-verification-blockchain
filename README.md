# Multichain-Based Certificate Verification System

A secure and decentralized certificate verification system built using Django REST Framework, React TypeScript, and Multichain. This system enables educational institutions to issue tamper-proof digital certificates that can be instantly verified by anyone.

## Group Members
- K21-3390 Fizza Rashid
- K21-3392 Rao Talha
- K21-4677 Haris Ahmad

## Features

### Core Features
- Blockchain-based certificate issuance and verification
- Secure and tamper-proof certificate storage
- Instant certificate verification using unique IDs
- Institution management with authentication
- RESTful API with JWT authentication

### Technical Features
- React TypeScript frontend with Material UI
- Django REST Framework backend
- JWT-based authentication with token refresh
- Robust form validation and error handling
- Responsive and mobile-friendly design
- Real-time certificate verification
- Secure password storage with hashing

## Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- Multichain 2.0 or higher
- PostgreSQL (optional, SQLite by default)

## Tech Stack

### Backend
- Django 4.x
- Django REST Framework
- djangorestframework-simplejwt
- django-cors-headers
- python-dotenv
- cryptography
- requests

### Frontend
- React 18
- TypeScript
- Material UI v5
- Axios with interceptors
- React Router v6
- Context API for state management

## Installation

### 1. Install Multichain
```bash
# For Ubuntu/Debian
wget https://www.multichain.com/download/multichain-2.3.3.tar.gz
tar -xvzf multichain-2.3.3.tar.gz
cd multichain-2.3.3
mv multichaind multichain-cli multichain-util /usr/local/bin
```

### 2. Set up the Backend

```bash
# Clone the repository
git clone <repository-url>
cd certificate_verification

# Create and activate virtual environment
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

# Install dependencies
pip install --upgrade pip  # Ensure pip is up to date
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your settings:
# - SECRET_KEY: Your Django secret key
# - DEBUG: Set to False in production
# - ALLOWED_HOSTS: Add your domain in production
# - CORS_ALLOWED_ORIGINS: Add your frontend URL

# Initialize the database
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Set up Multichain
python setup_chain.py

# Start the development server
python manage.py runserver
```

The backend will be available at http://localhost:8000

### 3. Set up the Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your settings:
# - REACT_APP_API_URL=http://localhost:8000

# Start the development server
npm start
```

The frontend will be available at http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/token/` - Obtain JWT token pair
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- `POST /api/token/refresh/` - Refresh access token
  ```json
  {
    "refresh": "string"
  }
  ```

### Certificates
- `POST /api/certificates/` - Issue a new certificate
  ```json
  {
    "student_name": "string",
    "student_id": "string",
    "student_email": "string",
    "course": "string",
    "grade": "string",
    "issue_date": "YYYY-MM-DD",
    "expiry_date": "YYYY-MM-DD",
    "metadata": {}
  }
  ```
- `GET /api/certificates/` - List all certificates
- `GET /api/certificates/<id>/` - Get certificate details
- `POST /api/certificates/verify/` - Verify a certificate
  ```json
  {
    "certificate_id": "string"
  }
  ```

### Institutions
- `POST /api/institutions/` - Create a new institution
  ```json
  {
    "name": "string",
    "address": "string",
    "email": "string",
    "website": "string"
  }
  ```
- `GET /api/institutions/` - List all institutions
- `GET /api/institutions/<id>/` - Get institution details

## Usage

### For Institutions
1. Create an institution account through the admin interface
2. Log in to the web interface using your credentials
3. Issue certificates for students/recipients with required details
4. The system will generate a unique certificate ID and store it on the blockchain
5. Share the certificate ID with the recipient

### For Certificate Holders
1. Receive the certificate ID from your institution
2. Visit the certificate verification page
3. Enter your certificate ID
4. View and verify your certificate details
5. Download or share your verified certificate

### For Verifiers
1. Request the certificate ID from the certificate holder
2. Use the public verification interface
3. Get instant verification results with certificate details

## Security Considerations

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control for institutions
- Password hashing using Django's auth system
- Token refresh mechanism for extended sessions

### API Security
- CORS protection with whitelisted origins
- CSRF protection for non-GET requests
- Rate limiting on sensitive endpoints
- Input validation and sanitization

### Blockchain Security
- Keep your Multichain RPC credentials secure
- Regular blockchain data backups
- Immutable certificate records
- Cryptographic verification

### Production Deployment
- Use HTTPS with valid SSL certificates
- Set DEBUG=False in Django settings
- Configure proper ALLOWED_HOSTS
- Regular security updates and patches
- Monitor system logs and access

## Development Team
- Backend Development: [Rao Talha]
  - Django REST Framework implementation
  - JWT authentication system
  - Database design and API endpoints
- Frontend Development: [Fizza Rashid]
  - React TypeScript architecture
  - Material UI components
  - Form validation and error handling
- Blockchain Integration: [Haris Ahmad]
  - Multichain setup and configuration
  - Certificate hashing and verification
  - Blockchain data management

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React](https://reactjs.org/)
- [Material UI](https://mui.com/)
- [Multichain](https://www.multichain.com/)
