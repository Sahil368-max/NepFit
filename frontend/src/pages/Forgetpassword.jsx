// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Activity, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email address");

    setIsLoading(true);

   
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      toast.success("Reset link sent!");
    }, 1500);

  
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 animate-fade-in">
      
      {/* Brand Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex justify-center mb-6">
        <Link to="/login" className="flex items-center gap-2 text-orange-600 hover:opacity-80 transition-opacity">
          <Activity size={36} strokeWidth={2.5} />
          <h1 className="text-3xl font-black tracking-tight text-gray-900">
            STRIDE<span className="text-orange-500">.FIT</span>
          </h1>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
          
          {!isSubmitted ? (
            
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset your password</h2>
                <p className="text-gray-500 text-sm">
                  Enter the email address associated with your account and we'll send you a link to reset your password.
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-gray-50 focus:bg-white outline-none"
                      placeholder="athlete@stride.fit"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-gray-900 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Send Reset Link"}
                </button>
              </form>
            </>
          ) : (
            
            <div className="text-center py-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your inbox</h2>
              <p className="text-gray-500 text-sm mb-8">
                If an account exists for <span className="font-bold text-gray-900">{email}</span>, we've sent a secure password reset link.
              </p>
              
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-sm font-bold text-orange-600 hover:text-orange-500 transition-colors"
              >
                Didn't receive the email? Click to resend.
              </button>
            </div>
          )}

          
          <div className="mt-8 border-t border-gray-100 pt-6">
            <Link to="/login" className="flex items-center justify-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft size={16} />
              Back to log in
            </Link>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;