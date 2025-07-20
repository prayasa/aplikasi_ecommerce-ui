// app/context/AuthContext.tsx

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Customer {
    name: string;
}

interface AuthContextType {
    adminToken: string | null;
    customer: Customer | null;
    setCustomer: (customerData: Customer | null) => void; // <-- Tambahkan ini
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [adminToken, setAdminToken] = useState<string | null>(null);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const customerData = localStorage.getItem('customerData');

        if (token) setAdminToken(token);
        if (customerData) setCustomer(JSON.parse(customerData));
        
        setLoading(false);
    }, []);

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('customerData');
        setAdminToken(null);
        setCustomer(null);
    };

    const handleSetCustomer = (customerData: Customer | null) => {
        setCustomer(customerData);
    };

    return (
        <AuthContext.Provider value={{ adminToken, customer, setCustomer: handleSetCustomer, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};