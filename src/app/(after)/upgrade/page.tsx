"use client";

import { useState } from "react";
import { Check, Zap, Crown, Sparkles } from "lucide-react";
import Script from "next/script";
import { getCurrentUserId } from "@/lib/auth";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function UpgradePage() {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("basic");
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  const plans = {
    basic: {
      name: "Basic",
      price: 499,
      period: "montly",
      savings: null,
    },
    pro: {
      name: "PRO",
      price: 4999,
      period: "yearly",
      savings: "Save ₹1,000",
    },
  };

  const features = [
    "Unlimited job postings",
    "Unlimited AI interviews",
    "Advanced analytics dashboard",
    "Priority support",
    "Custom branding",
    "Export reports",
  ];

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      alert("Payment system is loading. Please wait... Or you can reload page and try again");
      return;
    }
    setLoading(true);

    try {
      // Step 1: Create order in backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payments/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({
          userId: await getCurrentUserId(), // Replace with actual user ID
          planType: selectedPlan.toUpperCase(),
          amount: plans[selectedPlan as keyof typeof plans].price,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      const orderData = await response.json();

      // Step 2: Initialize Razorpay
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "AI Interview Pro",
        description: `${plans[selectedPlan as keyof typeof plans].name} Subscription`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // Step 3: Verify payment
          await verifyPayment(response);
        },
        prefill: {
          name: "User Name", 
          email: "user@example.com", 
          contact: "9999999999", 
        },
        theme: {
          color: "#3399cc",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to initiate payment. Please try again.");
      setLoading(false);
    }
  };

  const verifyPayment = async (paymentResponse: any) => {
    try {
      const response = await fetch("http://localhost:8080/api/payments/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({
          razorpayOrderId: paymentResponse.razorpay_order_id,
          razorpayPaymentId: paymentResponse.razorpay_payment_id,
          razorpaySignature: paymentResponse.razorpay_signature,
          userId: await getCurrentUserId(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        const refreshResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/refresh`,
          {
            method: "POST",
            credentials: "include", 
          }
        );
    
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          
          localStorage.setItem("accessToken", refreshData.accessToken);
          await fetch("/api/auth/set-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: refreshData.accessToken }),
          });

          toast.success("🎉 Payment successful! Your account has been upgraded.")
          window.location.href = "/dashboard";
        }
      }
    
      // if (data.success) {
      //   toast.success("🎉 Payment successful! Your account has been upgraded.")
      //   window.location.href = "/dashboard"; 
      // } else {
      //   alert("Payment verification failed. Please contact support.");
      // }
    } catch (error) {
      console.error("Verification error:", error);
      alert("Payment verification failed. Please contact support.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
        onError={() => {
          console.error("Failed to load Razorpay script");
          alert("Payment system failed to load. Please refresh the page.");
        }}
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Upgrade to Premium
            </h1>
            <p className="text-gray-600">
              Unlock unlimited access and advanced features
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSelectedPlan("basic")}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  selectedPlan === "basic"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Basic
              </button>
              <button
                onClick={() => setSelectedPlan("pro")}
                className={`px-6 py-2 rounded-md font-medium transition-all relative ${
                  selectedPlan === "pro"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                PRO
                {plans.pro.savings && (
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                    Save
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-blue-100">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Premium Plan</h2>
                  <p className="text-blue-100">Everything you need to succeed</p>
                </div>
                <Sparkles className="w-12 h-12 opacity-80" />
              </div>
              <div className="mt-6">
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold">
                    ₹{plans[selectedPlan as keyof typeof plans].price}
                  </span>
                  <span className="ml-2 text-blue-100">
                    / {plans[selectedPlan as keyof typeof plans].period}
                  </span>
                </div>
                {plans[selectedPlan as keyof typeof plans].savings && (
                  <div className="mt-2 inline-block bg-green-500 text-white text-sm px-3 py-1 rounded-full">
                    {plans[selectedPlan as keyof typeof plans].savings}
                  </div>
                )}
              </div>
            </div>

            <div className="p-8">
              <div className="space-y-4 mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">
                  What's included:
                </h3>
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="ml-3 text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Upgrade Now
                  </>
                )}
              </button>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Secure Payment
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Cancel Anytime
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    24/7 Support
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600">
              💯 30-day money-back guarantee. No questions asked.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}