"use client";
import { useContext, useState, useEffect, createContext } from "react";
import { useRouter } from "next/navigation";
const AuthContext = createContext();

export function AuthProvider({children}) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Check for existing JWT token on load and restore user state
    useEffect(() => {
        const checkExistingToken = async () => {
            try {
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://34.228.71.230:9092/api';

                // First try the regular user profile endpoint
                let response = await fetch(`${backendUrl}/profile`, {
                    method: 'GET',
                    credentials: 'include'
                });

                // If that fails with 401, try the business profile endpoint
                if (response.status === 401) {
                    response = await fetch(`${backendUrl}/business/profile`, {
                        method: 'GET',
                        credentials: 'include'
                    });
                }

                if (response.ok) {
                    const profileData = await response.json();
                    // Restore user state from profile data
                    setUser({
                        email: profileData.email,
                        role: profileData.role,
                        id: profileData.userId || profileData.bid
                    });
                }
            } catch (error) {
                // Token is invalid or expired, user remains null
                console.log('No valid existing session');
            } finally {
                setIsLoading(false);
            }
        };

        checkExistingToken();
    }, []);

    // No periodic refresh; rely on single 30-minute token validity
    useEffect(() => {
        return () => {};
    }, [user]);

    const login = async(email, password) => {
        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://18.207.128.131:9092/api';
            const response = await fetch(`${backendUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, password: password }),
                credentials: 'include'
            });

            if (!response.ok) {
                return response;
            }

            const data = await response.json();
            // Set user state after successful login
            setUser({
                email: data.email,
                role: data.role,
                id: data.userId
            });

            return response;
        } catch(e) {
            return new Response(JSON.stringify({ error: 'Network error during login' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    const logout = async() => {
        try{
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });

            if (response.ok) {
                setUser(null);  // Clear user state
                router.replace('/');  // Redirect to login page
            }

            return response;
        } catch(e) {
            return new Response(JSON.stringify({ error: 'Network error during logout' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }   

    const register = async(email, password) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, password: password }),
            });

            if (!response.ok) {
                return response;
            }

            const data = await response.json();
            // Set user state after successful registration
            setUser({
                email: data.email,
                role: data.role,
                id: data.userId
            });

            return response;
        } catch(e) {
            return new Response(JSON.stringify({ error: 'Network error during registration' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    // Removed refreshToken flow entirely

    const loginBusiness = async(email, password) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/business/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, password: password }),
                credentials: 'include'
            });

            if (!response.ok) {
                return response;
            }

            const data = await response.json();
            // Set user state after successful business login
            setUser({
                email: data.email,
                role: data.role,
                id: data.bid
            });

            return response;
        } catch(e) {
            return new Response(JSON.stringify({ error: 'Network error during business login' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    };

    const registerBusiness = async (businessData) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/business/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: businessData.name,
                    email: businessData.email,
                    companyName: businessData.companyName,
                    companyEmail: businessData.companyEmail,
                    address: businessData.address,
                    city: businessData.city,
                    state: businessData.state,
                    country: businessData.country,
                    password: businessData.password
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Business registration failed');
            }

            return response;
        } catch (e) {
            return new Response(JSON.stringify({ error: 'Network error during business registration' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    };

    const signInWithGoogle = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google-signin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Google sign-in failed:', errorData);
                throw new Error(errorData.error || 'Failed to sign in with Google');
            }

            const data = await response.json();
            // Redirect to Google OAuth consent screen
            window.location.href = data.url;
        } catch (error) {
            console.error('Failed to initialize Google sign in:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, loginBusiness, registerBusiness, setUser, logout, signInWithGoogle }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}