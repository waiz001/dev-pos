import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export interface User {
  id: string;
  username: string;
  name: string;
  role: "admin" | "cashier" | "manager";
  permissions: {
    products: boolean;
    orders: boolean;
    customers: boolean;
    reports: boolean;
    settings: boolean;
    users: boolean;
  };
}

// Predefined users for demo
const defaultUsers: User[] = [
  {
    id: "user-1",
    username: "admin",
    name: "Admin User",
    role: "admin",
    permissions: {
      products: true,
      orders: true,
      customers: true,
      reports: true,
      settings: true,
      users: true,
    },
  },
  {
    id: "user-2",
    username: "cashier",
    name: "Cashier User",
    role: "cashier",
    permissions: {
      products: true,
      orders: true,
      customers: true,
      reports: false,
      settings: false,
      users: false,
    },
  },
];

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  addUser: (user: Omit<User, "id">) => User;
  updateUser: (id: string, updates: Partial<User>) => User | null;
  deleteUser: (id: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = "pos_system_current_user";
const USERS_STORAGE_KEY = "pos_system_users";

// Helper functions to load and save users from localStorage
const loadUsers = (): User[] => {
  try {
    const storedData = localStorage.getItem(USERS_STORAGE_KEY);
    if (storedData) {
      return JSON.parse(storedData);
    }
    // Initialize with default users if none exist
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  } catch (error) {
    console.error("Error loading users:", error);
    return defaultUsers;
  }
};

const saveUsers = (users: User[]): void => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error("Error saving users:", error);
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(loadUsers());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();

  // Check for existing session on initial load
  useEffect(() => {
    try {
      const userJson = localStorage.getItem(CURRENT_USER_KEY);
      
      if (userJson) {
        const parsedUser = JSON.parse(userJson);
        
        // Ensure the user exists in the current users list
        const userExists = users.some(user => user.id === parsedUser.id);
        
        if (userExists) {
          // Ensure the stored user has all required permissions
          if (!parsedUser.permissions) {
            parsedUser.permissions = {
              products: false,
              orders: false,
              customers: false,
              reports: false,
              settings: false,
              users: false
            };
          }
          
          // Add any missing permissions with default false value
          const requiredPermissions = ['products', 'orders', 'customers', 'reports', 'settings', 'users'];
          requiredPermissions.forEach(perm => {
            if (parsedUser.permissions[perm] === undefined) {
              parsedUser.permissions[perm] = false;
            }
          });
          
          setCurrentUser(parsedUser);
          setIsAuthenticated(true);
        } else {
          // User doesn't exist anymore, clear storage
          console.warn("Stored user not found in users list, logging out");
          localStorage.removeItem(CURRENT_USER_KEY);
        }
      }
    } catch (e) {
      console.error("Error parsing stored user", e);
      localStorage.removeItem(CURRENT_USER_KEY);
    } finally {
      setIsInitialized(true);
    }
  }, [users]);

  const login = async (username: string, password: string): Promise<boolean> => {
    // In a real app, you would validate credentials against a backend
    // For demo purposes, we're just checking username and using any password
    const user = users.find((u) => u.username === username);
    
    if (user) {
      // Ensure the user has all required permissions
      if (!user.permissions) {
        user.permissions = {
          products: false,
          orders: false,
          customers: false,
          reports: false,
          settings: false,
          users: false
        };
      }
      
      // Set defaults based on role if not already set
      if (user.role === 'admin' && Object.values(user.permissions).some(p => p === false)) {
        user.permissions = {
          products: true,
          orders: true,
          customers: true,
          reports: true,
          settings: true,
          users: true
        };
      }
      
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      // Store user in localStorage with a timeout
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(CURRENT_USER_KEY);
    navigate("/login");
  };

  const addUser = (userData: Omit<User, "id">): User => {
    const newUser = {
      ...userData,
      id: `user-${Date.now()}`,
    };
    
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    saveUsers(updatedUsers);
    
    return newUser;
  };

  const updateUser = (id: string, updates: Partial<User>): User | null => {
    const index = users.findIndex((u) => u.id === id);
    
    if (index === -1) return null;
    
    const updatedUser = { ...users[index], ...updates };
    const updatedUsers = [
      ...users.slice(0, index),
      updatedUser,
      ...users.slice(index + 1),
    ];
    
    setUsers(updatedUsers);
    saveUsers(updatedUsers);
    
    // If the current user is updated, update the current user state
    if (currentUser && currentUser.id === id) {
      setCurrentUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    }
    
    return updatedUser;
  };

  const deleteUser = (id: string): boolean => {
    // Prevent deleting the last admin user
    const adminUsers = users.filter(u => u.role === "admin");
    const userToDelete = users.find(u => u.id === id);
    
    if (userToDelete?.role === "admin" && adminUsers.length <= 1) {
      return false;
    }
    
    const updatedUsers = users.filter((u) => u.id !== id);
    const success = updatedUsers.length < users.length;
    
    if (success) {
      setUsers(updatedUsers);
      saveUsers(updatedUsers);
      
      // If the current user is deleted, log out
      if (currentUser && currentUser.id === id) {
        logout();
      }
    }
    
    return success;
  };

  // If we're still initializing, show nothing
  if (!isInitialized) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        isAuthenticated,
        login,
        logout,
        addUser,
        updateUser,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
