"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface User {
  id: string;
  name: string;
  phone?: string;
  location?: string;
  avatarColor: string;
  initials: string;
}

interface UserContextType {
  currentUser: User | null;
  allUsers: User[];
  isLoading: boolean;
  error: string | null;
  setCurrentUser: (user: User) => void;
  createUser: (user: Omit<User, "id">) => Promise<User>;
  updateUser: (id: string, updates: Partial<User>) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
  refreshUsers: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Generate initials from name
function generateInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

// Generate random avatar color
function generateAvatarColor(): string {
  const colors = ["#C1440E", "#D4872A", "#6B7C5E", "#7587B1", "#B83232", "#4A7A4A"];
  return colors[Math.floor(Math.random() * colors.length)];
}

const CURRENT_USER_KEY = "machann-current-user-id";

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all users from API
  const refreshUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setAllUsers(data.users || []);
      return data.users || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load users and restore current user on mount
  useEffect(() => {
    const init = async () => {
      const users = await refreshUsers();

      // Try to restore saved current user
      const savedUserId = localStorage.getItem(CURRENT_USER_KEY);
      if (savedUserId && users.length > 0) {
        const savedUser = users.find((u: User) => u.id === savedUserId);
        if (savedUser) {
          setCurrentUserState(savedUser);
          return;
        }
      }

      // Default to first user or demo user
      if (users.length > 0) {
        const demoUser = users.find((u: User) => u.id === "demo-user-1") || users[0];
        setCurrentUserState(demoUser);
        localStorage.setItem(CURRENT_USER_KEY, demoUser.id);
      }
    };
    init();
  }, [refreshUsers]);

  // Set current user and persist
  const setCurrentUser = useCallback((user: User) => {
    setCurrentUserState(user);
    localStorage.setItem(CURRENT_USER_KEY, user.id);
  }, []);

  // Create new user
  const createUser = useCallback(async (userData: Omit<User, "id">): Promise<User> => {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...userData,
        initials: userData.initials || generateInitials(userData.name),
        avatarColor: userData.avatarColor || generateAvatarColor(),
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to create user");
    }

    const newUser = await response.json();
    setAllUsers((prev) => [...prev, newUser]);
    return newUser;
  }, []);

  // Update user
  const updateUser = useCallback(async (id: string, updates: Partial<User>): Promise<User> => {
    // If name changed, regenerate initials
    if (updates.name && !updates.initials) {
      updates.initials = generateInitials(updates.name);
    }

    const response = await fetch(`/api/users?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to update user");
    }

    const updatedUser = await response.json();
    setAllUsers((prev) => prev.map((u) => (u.id === id ? updatedUser : u)));

    // Update current user if it's the one being edited
    if (currentUser?.id === id) {
      setCurrentUserState(updatedUser);
    }

    return updatedUser;
  }, [currentUser]);

  // Delete user
  const deleteUser = useCallback(async (id: string): Promise<void> => {
    const response = await fetch(`/api/users?id=${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to delete user");
    }

    setAllUsers((prev) => prev.filter((u) => u.id !== id));

    // If deleted current user, switch to another
    if (currentUser?.id === id) {
      const remaining = allUsers.filter((u) => u.id !== id);
      if (remaining.length > 0) {
        setCurrentUser(remaining[0]);
      } else {
        setCurrentUserState(null);
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    }
  }, [currentUser, allUsers, setCurrentUser]);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        allUsers,
        isLoading,
        error,
        setCurrentUser,
        createUser,
        updateUser,
        deleteUser,
        refreshUsers,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
