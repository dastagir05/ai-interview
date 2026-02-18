"use client";

import { useEffect, useState } from "react";
import { Check, Zap } from "lucide-react";
import { useAuth } from "@/lib/useAuth";
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
      period: "monthly",
      savings: null,
    },
    pro: {
      name: "Pro",
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
      alert("Payment system is loading. Please wait or reload and try again.");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payments/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({
            userId: await getCurrentUserId(),
            planType: selectedPlan.toUpperCase(),
            amount: plans[selectedPlan as keyof typeof plans].price,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to create order");

      const orderData = await response.json();

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "AI Interview",
        description: `${plans[selectedPlan as keyof typeof plans].name} Subscription`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          await verifyPayment(response);
        },
        prefill: {
          name: "User Name",
          email: "user@example.com",
          contact: "9999999999",
        },
        theme: { color: "#000000" },
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
          { method: "POST", credentials: "include" }
        );

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          localStorage.setItem("accessToken", refreshData.accessToken);
          await fetch("/api/auth/set-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: refreshData.accessToken }),
          });

          toast.success("Payment successful. Your account has been upgraded.");
          window.location.href = "/dashboard";
        }
      }
    } catch (error) {
      console.error("Verification error:", error);
      alert("Payment verification failed. Please contact support.");
    } finally {
      setLoading(false);
    }
  };

  const currentPlan = plans[selectedPlan as keyof typeof plans];

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
        onError={() => alert("Payment system failed to load. Please refresh.")}
      />

      <div className="min-h-screen bg-white flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg">

          {/* Header */}
          <div className="mb-12">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400 mb-3">
              Premium Access
            </p>
            <h1 className="text-4xl font-bold text-black leading-tight tracking-tight">
              Unlock everything.
            </h1>
            <p className="text-zinc-500 mt-2 text-sm">
              One plan. Full access. Cancel anytime.
            </p>
          </div>

          {/* Plan Toggle */}
          <div className="flex gap-2 mb-8">
            {(["basic", "pro"] as const).map((plan) => (
              <button
                key={plan}
                onClick={() => setSelectedPlan(plan)}
                className={`relative flex-1 py-2.5 text-sm font-medium border transition-all duration-150 ${
                  selectedPlan === plan
                    ? "bg-black text-white border-black"
                    : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400"
                }`}
              >
                {plans[plan].name}
                {plans[plan].savings && selectedPlan !== plan && (
                  <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] px-1.5 py-0.5 leading-none">
                    SAVE
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Price */}
          <div className="border border-zinc-100 p-8 mb-6">
            <div className="flex items-end justify-between mb-6">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-black tracking-tight">
                    ₹{currentPlan.price}
                  </span>
                  <span className="text-zinc-400 text-sm mb-1">
                    / {currentPlan.period}
                  </span>
                </div>
                {currentPlan.savings && (
                  <p className="text-xs text-zinc-500 mt-1">{currentPlan.savings}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-400 uppercase tracking-widest">
                  {currentPlan.name}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-zinc-100 mb-6" />

            {/* Features */}
            <ul className="space-y-3 mb-8">
              {features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-zinc-700">
                  <Check className="size-3.5 text-black shrink-0" strokeWidth={2.5} />
                  {feature}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-black text-white text-sm font-semibold py-4 hover:bg-zinc-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="size-4" />
                  Upgrade Now
                </>
              )}
            </button>
          </div>

          {/* Trust row */}
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Secure payment</span>
            <span>·</span>
            <span>Cancel anytime</span>
            <span>·</span>
            <span>30-day guarantee</span>
          </div>

        </div>
      </div>
    </>
  );
}