# Time Clock App

A professional time clock application for employee management with FastAPI backend and React frontend.

## Features

- **User Authentication**: JWT-based login system
- **Employee Management**: Admin can create and manage employee accounts
- **Time Tracking**: Clock in/out functionality with session tracking
- **Schedule Management**: Admins can set weekly schedules for employees
- **Dashboard Views**: Separate dashboards for admins and employees
- **Real-time Clock**: Live session timer and clock display
- **Professional UI**: Modern dark theme with animations

## Tech Stack

### Backend
- **FastAPI**: High-performance async web framework
- **SQLAlchemy**: ORM for database operations
- **SQLite**: Database for development
- **JWT**: JSON Web Tokens for authentication
- **Python-Jose**: JWT encoding/decoding
- **Loguru**: Structured logging

### Frontend
- **React 19**: Modern React with hooks
- **Material-UI (MUI)**: Component library with dark theme
- **Axios**: HTTP client with interceptors
- **Framer Motion**: Smooth animations
- **React Router**: Client-side routing

## Project Structure

```
time-clock-app/
├── app/                          # FastAPI backend
│   ├── main.py                   # Application entry point
│   ├── auth.py                   # Authentication utilities
│   ├── config/                   # Configuration modules
│   ├── db/                       # Database setup
│   ├── dto/                      # Data transfer objects
│   ├── models/                   # SQLAlchemy models
│   ├── routes/                   # API endpoints
│   └── utils/                    # Utility functions
├── frontend/                     # React frontend
│   ├── src/
│   │   ├── components/           # React components
│   │   ├── api.js               # API client
│   │   └── App.js               # Main app component
│   └── package.json
├── alembic/                      # Database migrations
├── test/                         # Test files
└── pyproject.toml               # Python dependencies
```

## Installation & Setup

### Prerequisites
- Python 3.11+ with Poetry
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Install Poetry** (if not already installed):
   ```bash
   curl -sSL https://install.python-poetry.org | python3 -
   ```

2. **Install Dependencies**:
   ```bash
   poetry install
   ```

3. **Activate Poetry Shell**:
   ```bash
   poetry shell
   ```

4. **Run Database Migrations**:
   ```bash
   alembic upgrade head
   ```

5. **Start Backend Server**:
   ```bash
   poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

### Frontend Setup

1. **Install Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**:
   ```bash
   PORT=5173 npm start
   ```

## Usage

### Default Admin Account
- **Email**: `admin@example.com`
- **Password**: `adminpass`

### API Endpoints

- `POST /login` - User authentication
- `POST /register` - User registration
- `POST /create-user` - Admin creates new users
- `GET /users` - Admin lists all users
- `POST /clock-in` - Employee clocks in
- `PUT /clock-out` - Employee clocks out
- `GET /my-entries` - Employee views their time entries
- `GET /all-entries` - Admin views all time entries
- `GET /my-schedule` - Employee views their schedule
- `PUT /schedules/{user_id}` - Admin sets employee schedule

### Features Overview

1. **Admin Dashboard**:
   - View all employees and their status
   - Create new employee accounts
   - Set weekly schedules for employees
   - View all time entries across the organization

2. **Employee Dashboard**:
   - Clock in/out with animated button
   - View personal time entries
   - See assigned weekly schedule
   - Live session timer

## Development

### Running Tests
```bash
# Backend tests
poetry run pytest

# Frontend tests
cd frontend && npm test
```

### Building for Production
```bash
# Frontend build
cd frontend && npm run build

# Backend can be deployed with uvicorn or gunicorn
```

## Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///./time_clock.db
```

### CORS Configuration
The backend is configured to allow requests from:
- `http://localhost:3000` (default React port)
- `http://localhost:5173` (Vite default port)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

This project is for educational purposes.

## Author

Daniel Cortés Casadas
