"use client";
import React from "react";
import { useEffect } from "react";

type LoginProps = {
  openDialog: boolean;
  closeDialog: () => void;
};

const Login: React.FC<LoginProps> = ({ openDialog, closeDialog }) => {
  useEffect(() => {
    if (openDialog) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [openDialog]);

  if (!openDialog) return null;
  return (
    <div className="fixed h-screen inset-0 z-50 flex items-center justify-center text-black bg-white/30 backdrop-blur-xs">
      <div className="relative bg-white rounded-lg shadow-md p-6 w-[90%] max-w-sm text-center">
        <button
          onClick={closeDialog}
          className="absolute top-2 right-3 text-black text-xl font-bold  w-6 h-6 rounded"
        >
          ×
        </button>

        <h2 className="text-4xl font-bold mb-8 py-2">
          Welcome to IPrepWithAI
        </h2>

        <button
          onClick={() => {
            window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/oauth2/authorization/google`;
          }}
          className="flex items-center justify-center w-full border rounded px-4 py-2  hover:bg-gray-100"
        >
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
            alt="Google"
            className="w-5 h-5 mr-2"
          />
          Continue with Google
        </button>

        <div className="flex items-center my-2">
          <div className="flex-grow h-px bg-gray-300" />
          <span className="mx-2 text-gray-500">Or</span>
          <div className="flex-grow h-px bg-gray-300" />
        </div>

        <button
          onClick={() => {
            window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/oauth2/authorization/github`;
          }}
          className="flex items-center justify-center w-full border rounded px-4 py-2 mb-3 hover:bg-gray-100"
        >
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"
            alt="GitHub"
            className="w-5 h-5 mr-2"
          />
          Continue with GitHub
        </button>
        {/* <button className="w-full mt-3 bg-green-500 hover:bg-green-600 text-white py-2 rounded">
          Continue
        </button> */}

        <p className="text-xs text-gray-500 mt-4">
          By proceeding, I agree to{" "}
          <a href="#" className="text-blue-600 underline">
            T&C
          </a>
          ,{" "}
          <a href="#" className="text-blue-600 underline">
            Privacy Policy
          </a>{" "}
          &{" "}
          <a href="#" className="text-blue-600 underline">
            Tariff Rates
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
