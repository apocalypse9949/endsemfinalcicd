"use client"

import React, { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import BusinessNetwork from '@/app/components/Globe/Globe';
import './page.css';

const Bauthen = () => {
  const { loginBusiness } = useAuth();
  const [isSignUp, setIsSignUp] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [verified, setVerified] = useState(true); // Skip OTP verification for now
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  
  // Initialize all form input states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    companyEmail: '',
    companyName: '',
    loginEmail: '',
    password: ''
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    setError('');
  };

  // OTP verification removed - using MySQL backend without email verification for now

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSignUp) {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.companyName ||
          !formData.address || !formData.companyEmail || !formData.password) {
        toast.error('Please fill in all required fields');
        return;
      }

      try {
        setLoading(true);

        // Register business using Spring Boot backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/business/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            companyName: formData.companyName,
            address: formData.address,
            companyEmail: formData.companyEmail,
            password: formData.password
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Registration failed');
        }

        toast.success(`Registration successful! Your Business ID is: ${data.bid}`);

        // Clear form data
        setFormData({
          name: '',
          email: '',
          address: '',
          companyEmail: '',
          companyName: '',
          loginEmail: '',
          password: ''
        });
        
        // Switch to login after a short delay
        setTimeout(() => {
          setIsSignUp(false);
        }, 1500);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    } else {
      if (!formData.loginEmail) {
        toast.error('Please enter your company email');
        return;
      }

      try {
        setLoading(true);
        const response = await loginBusiness(formData.loginEmail, formData.password);

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Login failed');
        }

        toast.success('Login successful! Redirecting to business dashboard...');
        setTimeout(() => {
          window.location.href = '/business';
        }, 1000);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="page-container">
      <Toaster position="top-right" />
      <div className="outer-container">
        <div className="auth-container">
          <div className="auth-image">
            <BusinessNetwork />
          </div>
          <div className="auth-card">
            <h2>{isSignUp ? 'Register as Client' : 'Client Login'}</h2>
            <p>{isSignUp 
              ? 'Create your client account to start posting projects' 
              : 'Login to manage your projects and freelancers'}
            </p>
            <div className="toggle-buttons">
              <button 
                onClick={() => setIsSignUp(false)} 
                className={!isSignUp ? 'active' : ''}
                disabled={loading}
              >
                Client Login
              </button>
              <button 
                onClick={() => setIsSignUp(true)} 
                className={isSignUp ? 'active' : ''}
                disabled={loading}
              >
                Register Client
              </button>
            </div>
            {isSignUp ? (
              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <input
                    type="text"
                    id="name"
                    placeholder=" "
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                  <label htmlFor="name">Name</label>
                </div>
                <div className="input-group">
                  <input
                    type="email"
                    id="email"
                    placeholder=" "
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                  <label htmlFor="email">Email</label>
                </div>
                <div className="input-group">
                  <input
                    type="text"
                    id="companyName"
                    placeholder=" "
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                  <label htmlFor="companyName">Client Name</label>
                </div>
                <div className="input-group">
                  <input
                    type="text"
                    id="address"
                    placeholder=" "
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                  <label htmlFor="address">Address</label>
                </div>
                <div className="input-group">
                  <input
                    type="email"
                    id="companyEmail"
                    placeholder=" "
                    value={formData.companyEmail}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                  <label htmlFor="companyEmail">Client Email</label>
                </div>
                <div className="input-group">
                  <input
                    type="password"
                    id="password"
                    placeholder=" "
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                  <label htmlFor="password">Password</label>
                </div>
                <button type="submit" disabled={loading}>
                  {loading ? 'Processing...' : 'Register Client'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <input 
                    type="email" 
                    id="loginEmail" 
                    placeholder=" " 
                    value={formData.loginEmail}
                    onChange={handleInputChange}
                    required 
                    disabled={loading}
                  />
                  <label htmlFor="loginEmail">Client Email</label>
                </div>
                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    placeholder=" "
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                  <label htmlFor="password">Password</label>
                </div>
                <div className="show-password">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  />
                  <label>Show Password</label>
                </div>
                <p className="login-note">
                  Looking to freelance? <a href="/auth">Click here</a> to go to the freelancer login.
                </p>
                <button type="submit" disabled={loading}>
                  {loading ? 'Processing...' : 'Sign In to Client Account'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bauthen;
