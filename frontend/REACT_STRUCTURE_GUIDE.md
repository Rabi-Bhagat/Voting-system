# React Frontend Structure Guide

## 📁 New Professional Folder Structure

```
frontend/src/
├── config/                          # Configuration files
│   └── environment.js              # API and app configuration
│
├── constants/                       # App-wide constants
│   ├── apiEndpoints.js             # API endpoint definitions
│   ├── messages.js                 # Error and success messages
│   └── index.js                    # Export all constants
│
├── services/                        # Business logic & API calls
│   ├── api/
│   │   ├── apiClient.js            # Axios instance with interceptors
│   │   ├── authService.js          # Authentication API calls
│   │   ├── adminService.js         # Admin API calls
│   │   ├── voterService.js         # Voter API calls
│   │   └── index.js                # Export all API services
│   └── index.js                    # Export all services
│
├── hooks/                           # Custom React hooks
│   ├── useAuth.js                  # Authentication hook
│   ├── useFetch.js                 # Data fetching hook
│   └── index.js                    # Export all hooks
│
├── utils/                           # Utility functions
│   ├── helpers/
│   │   ├── dateHelpers.js          # Date formatting functions
│   │   └── index.js
│   ├── validators/
│   │   ├── emailValidator.js       # Email validation
│   │   ├── passwordValidator.js    # Password validation
│   │   └── index.js
│   └── index.js                    # Export all utils
│
├── pages/                           # Page components (routes)
│   ├── auth/
│   │   ├── LoginPage/
│   │   │   ├── LoginPage.jsx       # Login page component
│   │   │   ├── LoginPage.module.css # Login page styles
│   │   │   └── index.js            # Export
│   │   └── index.js                # Export auth pages
│   ├── admin/
│   │   ├── AdminDashboard/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminDashboard.module.css
│   │   │   └── index.js
│   │   └── index.js
│   ├── results/
│   │   ├── ResultsPage/
│   │   │   ├── ResultsPage.jsx
│   │   │   ├── ResultsPage.module.css
│   │   │   └── index.js
│   │   └── index.js
│   └── index.js                    # Export all pages
│
├── components/                      # Reusable UI components
│   ├── common/                      # Shared components
│   │   ├── Button/
│   │   ├── Modal/
│   │   ├── Card/
│   │   └── index.js
│   ├── admin/                       # Admin-specific components
│   │   ├── UserCard/
│   │   ├── VerificationPanel/
│   │   └── index.js
│   ├── voter/                       # Voter-specific components
│   │   ├── BallotPaper/
│   │   └── index.js
│   └── index.js                    # Export all components
│
├── styles/                          # Global styles
│   ├── globals.css                 # Global styles
│   ├── variables.css               # CSS variables
│   └── index.css                   # Main entry point
│
├── assets/                          # Static files
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── App.jsx                          # Main App component
├── App.css                          # App styles
├── index.jsx                        # React entry point
├── index.css                        # Entry styles
└── jsconfig.json                    # Path aliases configuration
```

---

## 🎯 Key Principles

### 1. **Feature-Based Organization**
- Components organized by feature (admin, voter, party)
- Pages organized by feature
- Services organized by feature
- Easy to find all related code

### 2. **Separation of Concerns**
- **Components**: UI rendering only
- **Services**: API calls and business logic
- **Hooks**: Reusable logic
- **Utils**: Helper functions
- **Constants**: App-wide constants

### 3. **Co-location**
- Component + styles + tests in same folder
- Related files grouped together
- Easy to maintain and delete

### 4. **Clean Imports**
- Path aliases for clean imports
- Barrel exports for simplified imports
- No relative path imports

---

## 📝 File Organization Examples

### Component Structure
```
components/admin/UserCard/
├── UserCard.jsx              # Component logic
├── UserCard.module.css       # Component styles
├── UserCard.test.jsx         # Component tests
└── index.js                  # Export
```

### Page Structure
```
pages/admin/AdminDashboard/
├── AdminDashboard.jsx        # Page component
├── AdminDashboard.module.css # Page styles
├── AdminDashboard.test.jsx   # Page tests
└── index.js                  # Export
```

### Service Structure
```
services/api/
├── apiClient.js              # Axios instance
├── authService.js            # Auth API calls
├── adminService.js           # Admin API calls
└── index.js                  # Export all
```

---

## 🔄 Import Patterns

### Before (Old Structure)
```javascript
import Login from '../Login';
import AdminPage from '../pages/AdminPage';
import { verifyUser } from '../utils/api';
import '../styles/admin_page.css';
```

### After (New Structure)
```javascript
import { LoginPage } from '@/pages';
import { AdminDashboard } from '@/pages/admin';
import { adminService } from '@/services';
import { useAuth } from '@/hooks';
import { API_ENDPOINTS } from '@/constants';
import styles from './AdminDashboard.module.css';
```

---

## 🚀 Adding New Features

### Step 1: Create Page
```bash
mkdir -p src/pages/voter/VoterDashboard
touch src/pages/voter/VoterDashboard/{VoterDashboard.jsx,VoterDashboard.module.css,index.js}
```

### Step 2: Create Components
```bash
mkdir -p src/components/voter/BallotPaper
touch src/components/voter/BallotPaper/{BallotPaper.jsx,BallotPaper.module.css,index.js}
```

### Step 3: Create Service
```bash
touch src/services/api/voterService.js
```

### Step 4: Update Exports
- Update `src/pages/voter/index.js`
- Update `src/pages/index.js`
- Update `src/services/api/index.js`

### Step 5: Update Routes
- Add route in `src/App.jsx`

---

## 📚 Service Layer Pattern

### API Service Example
```javascript
// services/api/adminService.js
export const adminService = {
  getVoters: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.DASHBOARD_VOTERS);
    return response.data;
  },

  verifyVoter: async (voterId) => {
    const response = await apiClient.put(
      `${API_ENDPOINTS.ADMIN.VERIFY_VOTER}/${voterId}`,
      { is_verified: true }
    );
    return response.data;
  },
};
```

### Using Service in Component
```javascript
// pages/admin/AdminDashboard/AdminDashboard.jsx
import { adminService } from '@/services';

export function AdminDashboard() {
  const handleResetVotes = async () => {
    try {
      await adminService.resetVotes();
      showMessage('Votes reset successfully!');
    } catch (err) {
      showMessage('Failed to reset votes');
    }
  };
}
```

---

## 🎣 Custom Hooks Pattern

### Hook Example
```javascript
// hooks/useAuth.js
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      return response;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, error, login };
};
```

### Using Hook in Component
```javascript
// pages/auth/LoginPage/LoginPage.jsx
import { useAuth } from '@/hooks';

export function LoginPage() {
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(formData);
  };
}
```

---

## 🎨 CSS Modules Pattern

### Component Styles
```css
/* components/admin/UserCard/UserCard.module.css */
.card {
  background: #fff;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.verified {
  color: #4caf50;
  font-weight: 600;
}
```

### Using Styles in Component
```javascript
// components/admin/UserCard/UserCard.jsx
import styles from './UserCard.module.css';

export function UserCard({ user }) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3>{user.name}</h3>
        {user.is_verified && <span className={styles.verified}>✅ Verified</span>}
      </div>
    </div>
  );
}
```

---

## 🔐 Constants Pattern

### Define Constants
```javascript
// constants/apiEndpoints.js
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/login',
    LOGOUT: '/logout',
  },
  ADMIN: {
    VERIFY_VOTER: '/admin/verify/voter',
    RESET_VOTES: '/admin/reset-votes',
  },
};

// constants/messages.js
export const ERROR_MESSAGES = {
  LOGIN_FAILED: 'Login failed. Please check your credentials.',
  NETWORK_ERROR: 'Network error. Please try again.',
};
```

### Using Constants
```javascript
import { API_ENDPOINTS, ERROR_MESSAGES } from '@/constants';

// Use in service
const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, data);

// Use in component
catch (err) {
  setError(ERROR_MESSAGES.LOGIN_FAILED);
}
```

---

## ✅ Best Practices

### 1. **Keep Components Small**
- One component per file
- Single responsibility
- Easy to test and maintain

### 2. **Use Hooks for Logic**
- Extract logic to custom hooks
- Reuse logic across components
- Easier to test

### 3. **Centralize API Calls**
- All API calls in services
- Easy to change API endpoints
- Consistent error handling

### 4. **Use Constants**
- No magic strings
- Easy to update values
- Centralized configuration

### 5. **Organize by Feature**
- Group related files
- Easy to find code
- Simple to add/remove features

---

## 🧪 Testing Structure

### Component Tests
```javascript
// components/admin/UserCard/UserCard.test.jsx
import { render, screen } from '@testing-library/react';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  it('renders user name', () => {
    const user = { name: 'John Doe', is_verified: true };
    render(<UserCard user={user} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

### Service Tests
```javascript
// services/api/adminService.test.js
import { adminService } from './adminService';
import { apiClient } from './apiClient';

jest.mock('./apiClient');

describe('adminService', () => {
  it('calls correct endpoint for getVoters', async () => {
    await adminService.getVoters();
    expect(apiClient.get).toHaveBeenCalledWith('/admin-dashboard/voters');
  });
});
```

---

## 📊 Folder Structure Benefits

| Aspect | Before | After |
|--------|--------|-------|
| **Navigation** | Hard to find files | Easy to find files |
| **Scalability** | Difficult to scale | Scales well |
| **Maintenance** | Hard to maintain | Easy to maintain |
| **Testing** | Scattered tests | Co-located tests |
| **Collaboration** | Merge conflicts | Clear boundaries |
| **Onboarding** | 1 week | 1 day |

---

## 🚀 Getting Started

### 1. Understand the Structure
- Read this guide
- Review the folder organization
- Understand the patterns

### 2. Create New Features
- Follow the structure
- Use the patterns
- Keep it consistent

### 3. Maintain Consistency
- Follow naming conventions
- Use path aliases
- Keep components small

### 4. Document Your Code
- Add JSDoc comments
- Document complex logic
- Keep README updated

---

## 📞 Common Questions

### Q: Where do I put a new component?
A: In `components/{feature}/ComponentName/`

### Q: Where do I put API calls?
A: In `services/api/{feature}Service.js`

### Q: Where do I put helper functions?
A: In `utils/helpers/{name}.js`

### Q: Where do I put constants?
A: In `constants/{name}.js`

### Q: How do I import files?
A: Use path aliases: `import { Component } from '@/components/feature'`

---

## ✨ Summary

This structure provides:
- ✅ Clear organization
- ✅ Easy navigation
- ✅ Scalability
- ✅ Maintainability
- ✅ Collaboration
- ✅ Professional appearance

**Happy coding! 🚀**
