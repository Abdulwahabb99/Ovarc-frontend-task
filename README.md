<<<<<<< HEAD
# 📚 Bookstore Admin Interface

## 📝 Code Review Summary

### Critical Issues

- **No TypeScript**: Missing type safety and developer experience benefits
- **No Testing**: Zero test coverage, no testing framework configured
- **Security Vulnerabilities**: No input validation, XSS prevention, or CSRF protection
- **Accessibility Issues**: Missing semantic HTML, ARIA labels, and keyboard navigation
- **Performance Problems**: No memoization, inefficient re-renders, missing code splitting

### 🔄 Architecture Decisions
=======
# OVARC TASK - Bookstore Admin Interface

## Tech Stack
- **Vite**: Fast build tool and dev server.
- **React Router**: Dynamic routing with code splitting.
- **Tailwind CSS**: Utility-first CSS framework.
- **MSW**: Mock Service Worker for API mocking.
- **React Context**: Authentication state management.

## Code Review Findings

### Critical Issues
- **No TypeScript**: Missing type safety and developer experience benefits
- **No Testing**: Zero test coverage, no testing framework configured
- **Security Vulnerabilities**: No input validation, XSS prevention, or CSRF protection
- **Accessibility Issues**: Missing semantic HTML, ARIA labels, and keyboard navigation
- **Performance Problems**: No memoization, inefficient re-renders, missing code splitting

### Architecture & DX Issues
- **Inconsistent Data Fetching**: Mixed patterns between useLibraryData and direct fetching
- **Missing Error Boundaries**: App crashes on errors without graceful fallbacks
- **No State Management**: Local state only, no global state solution
- **Poor Error Handling**: Basic console.error without user feedback
- **Limited Development Tools**: Missing linting rules, formatting, and pre-commit hooks

## Environment Configuration

### Mock Server Toggle
Set `VITE_USE_MOCK_API=true` to use mock server, `false` for real backend.

```bash
# Use mock server (default)
VITE_USE_MOCK_API=true

# Use real backend
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=http://localhost:3001
```

## Setup
1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Start with mock server** (default):
   ```bash
   VITE_USE_MOCK_API=true npm run dev
   ```

4. **Run tests**:
   ```bash
   npm test
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

## Mock Server

The application includes a Mock Service Worker (MSW) setup for development and testing:

- **Mock Users**: 
  - `admin` / `admin123` (Admin role)
  - `manager` / `manager123` (Manager role)  
  - `user` / `user123` (User role)

- **API Endpoints**: All existing data endpoints are mocked
- **Authentication**: Mock login/logout with role-based permissions
- **Inventory Management**: Full CRUD operations for store inventory

## Authentication

- **Sign In/Out**: Use the authentication button in the top-right corner
- **Role-based Access**: Only admin and manager roles can edit inventory
- **Protected Routes**: Unauthenticated users cannot perform admin actions
- **Session Management**: Authentication state persists across page refreshes

## Store Inventory Features

- **Books Tab**: View all books in a store with full table functionality
- **Search**: Real-time search across book titles, authors, and IDs
- **Sorting**: Click column headers to sort by any field
- **Inline Editing**: Click "Edit" next to price to update book prices
- **Add Books**: Search and add books to store inventory with pricing
- **Remove Books**: Delete books from store inventory
- **Responsive Design**: Works on desktop and mobile devices
>>>>>>> 0a1e6ff (feat : Add authentication and inventory management features with MSW for API mocking. Implemented context for user authentication, added protected routes, and created components for adding books and managing inventory. Updated README with setup instructions and code review findings. Enhanced package dependencies for testing and development.)

- **State Management**: React Context + useReducer
- **API Layer**: Centralized client with retry logic
- **Mock Strategy**: MSW for development and testing
- **Routing**: React Router with code splitting

**Authentication not persisting?**

- Check browser console for errors
- Verify MSW handlers are active
- Clear localStorage and retry

![React](https://img.shields.io/badge/React-19.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue)
![Vite](https://img.shields.io/badge/Vite-6.3.2-purple)
![Tailwind](https://img.shields.io/badge/Tailwind-4.1.4-cyan)

## 🚀 Features

### 🏪 Store Management

- **Store Inventory**: View and manage books in each store
- **Real-time Search**: Search across book titles, authors, and IDs
- **Column Sorting**: Sort by any field with visual indicators
- **Inline Editing**: Edit book prices directly in the table
- **Add/Remove Books**: Manage store inventory with modal interface

### 👤 Authentication & Authorization

- **Role-based Access Control**: Admin, Manager, and User roles
- **Protected Routes**: Secure admin functionality
- **Session Management**: Persistent authentication state
- **Mock Authentication**: Development-ready user system

### 📊 Data Management

- **Mock Service Worker**: Full API mocking for development
- **Environment Toggle**: Switch between mock and real backend
- **TypeScript**: Full type safety and developer experience
- **Optimistic Updates**: Immediate UI feedback

## 🛠️ Tech Stack

| Technology       | Version | Purpose                 |
| ---------------- | ------- | ----------------------- |
| **React**        | 19.0.0  | UI Framework            |
| **TypeScript**   | 5.0.0   | Type Safety             |
| **Vite**         | 6.3.2   | Build Tool & Dev Server |
| **React Router** | 7.5.1   | Client-side Routing     |
| **Tailwind CSS** | 4.1.4   | Styling Framework       |
| **MSW**          | 2.0.0   | API Mocking             |
| **Vitest**       | 0.34.0  | Testing Framework       |

## 📦 Installation

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd Frontend-Task

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Mock Server Toggle
VITE_USE_MOCK_API=true

# Real Backend URL (when VITE_USE_MOCK_API=false)
VITE_API_BASE_URL=http://localhost:3001
```

### Mock vs Real Backend

| Mode            | Configuration             | Use Case                    |
| --------------- | ------------------------- | --------------------------- |
| **Development** | `VITE_USE_MOCK_API=true`  | Local development with MSW  |
| **Production**  | `VITE_USE_MOCK_API=false` | Connect to real backend API |

## 🔐 Authentication

### Mock Users

| Username  | Password     | Role    | Permissions                 |
| --------- | ------------ | ------- | --------------------------- |
| `admin`   | `admin123`   | Admin   | Full access to all features |
| `manager` | `manager123` | Manager | Can edit inventory          |
| `user`    | `user123`    | User    | Read-only access            |

### Authentication Flow

1. Click **Sign In** in the top-right corner
2. Enter username and password
3. Access level determined by role
4. Protected features automatically hidden for unauthorized users

## 📋 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm test             # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:ui      # Run tests with UI

# Code Quality
npm run lint         # Run ESLint
```

## 🏗️ Project Structure

```
src/
├── 📁 api/                 # API client and types
│   ├── client.ts          # Centralized API client
│   └── types.ts           # API type definitions
├── 📁 components/         # Reusable UI components
│   ├── AddBookModal.tsx   # Book addition modal
│   ├── InventoryTable.tsx # Store inventory table
│   ├── ProtectedRoute.tsx # Route protection
│   └── AuthButton.tsx     # Authentication UI
├── 📁 contexts/           # React Context providers
│   └── AuthContext.tsx    # Authentication state
├── 📁 hooks/              # Custom React hooks
│   ├── useInventory.ts    # Inventory management
│   └── useLibraryData.js  # Data fetching
├── 📁 pages/              # Page components
│   ├── StoreInventory.tsx # Store management page
│   ├── Home.tsx          # Landing page
│   └── ...
├── 📁 types/              # TypeScript definitions
│   └── index.ts           # Global types
└── 📁 mocks/              # MSW mock handlers
    ├── handlers.js        # API mock definitions
    ├── browser.js         # Browser MSW setup
    └── server.js          # Node MSW setup
```

## 🔄 API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Inventory Management

- `GET /api/inventory/:storeId/books` - Get store books
- `POST /api/inventory` - Add book to store
- `PUT /api/inventory/:id` - Update book price
- `DELETE /api/inventory/store/:storeId/book/:bookId` - Remove book

### Data Access

- `GET /api/books` - Get all books
- `GET /api/authors` - Get all authors
- `GET /api/stores` - Get all stores

## 🎯 Key Features

### Store Inventory Management

- **📊 Data Table**: Sortable columns with search functionality
- **✏️ Inline Editing**: Click to edit book prices
- **➕ Add Books**: Modal interface with searchable book selection
- **🗑️ Remove Books**: One-click book removal with confirmation
- **🔍 Real-time Search**: Filter books by title, author, or ID

### Responsive Design

- **📱 Mobile-friendly**: Works on all screen sizes
- **🎨 Modern UI**: Clean, professional interface
- **⚡ Fast Performance**: Optimized with React.memo and useMemo
- **♿ Accessible**: Semantic HTML and keyboard navigation

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in UI mode
npm run test:ui
```

### Test Coverage

- ✅ Component unit tests
- ✅ Hook testing
- ✅ Integration tests
- ✅ Authentication flow testing

## 🚀 Deployment

### Production Build

```bash
npm run build
```

### Environment Setup

1. Set `VITE_USE_MOCK_API=false`
2. Configure `VITE_API_BASE_URL` to your backend
3. Build and deploy the `dist/` folder

### Deployment Platforms

- **Vercel**: Zero-config deployment
- **Netlify**: Drag and drop `dist/` folder
- **Docker**: Use included Dockerfile

## 🔧 Development

### Code Quality

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting (configured)
- **Husky**: Pre-commit hooks (optional)

### Performance Optimizations

- **Code Splitting**: Route-based lazy loading
- **Memoization**: React.memo and useMemo usage
- **Bundle Analysis**: Optimized build output
- **Tree Shaking**: Unused code elimination

## 🐛 Troubleshooting

### Common Issues

**MSW not working?**

```bash
# Clear browser cache and restart
npm run dev
```

**TypeScript errors?**

```bash
# Check type definitions
npm run build
```
