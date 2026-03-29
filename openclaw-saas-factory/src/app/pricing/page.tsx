'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Check } from 'lucide-react';
import axios from 'axios';

export default function Pricing() {
  const { data: session } = useSession();

  const handleSubscribe = async (plan: string) => {
    // In a real implementation this would redirect to Stripe/PayPal checkout
    alert('Subscription flow to be implemented with real Stripe/PayPal checkout.');
  };

  return (
    <div className="min-h-screen bg-[#080c10] py-20 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
          Pricing Plans
        </h1>
        <p className="mt-5 max-w-xl mx-auto text-xl text-gray-400">
          Start generating real SaaS applications today. Choose the plan that fits your needs.
        </p>
      </div>

      <div className="mt-16 max-w-7xl mx-auto grid gap-8 lg:grid-cols-2 lg:max-w-4xl">
        {/* Free Plan */}
        <div className="bg-[#0f1419] border border-[#1f2d3d] rounded-2xl shadow-sm flex flex-col p-8">
          <div className="flex-1">
            <h3 className="text-2xl font-semibold text-white">Starter</h3>
            <p className="mt-4 flex items-baseline text-white">
              <span className="text-5xl font-extrabold tracking-tight">$0</span>
              <span className="ml-1 text-xl font-semibold text-gray-400">/month</span>
            </p>
            <p className="mt-6 text-gray-400">Perfect for exploring the capabilities of OpenClaw.</p>

            <ul className="mt-6 space-y-4">
              <li className="flex text-gray-300">
                <Check className="flex-shrink-0 w-6 h-6 text-[#00ff9d]" />
                <span className="ml-3">10 Generations Credits</span>
              </li>
              <li className="flex text-gray-300">
                <Check className="flex-shrink-0 w-6 h-6 text-[#00ff9d]" />
                <span className="ml-3">Standard AI Models</span>
              </li>
              <li className="flex text-gray-300">
                <Check className="flex-shrink-0 w-6 h-6 text-[#00ff9d]" />
                <span className="ml-3">Community Support</span>
              </li>
            </ul>
          </div>
          <div className="mt-8">
            <Link
              href="/dashboard"
              className="block w-full py-3 px-4 bg-[#161d26] hover:bg-[#1e2833] border border-[#1f2d3d] rounded-md text-center font-medium text-white transition-colors"
            >
              Get Started for Free
            </Link>
          </div>
        </div>

        {/* Pro Plan */}
        <div className="bg-[#0f1419] border-2 border-[#00d4ff] rounded-2xl shadow-sm flex flex-col p-8 relative">
          <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
            <span className="bg-[#00d4ff] text-black text-sm font-bold uppercase tracking-widest py-1 px-3 rounded-full">
              Most Popular
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-semibold text-white">Pro</h3>
            <p className="mt-4 flex items-baseline text-white">
              <span className="text-5xl font-extrabold tracking-tight">$49</span>
              <span className="ml-1 text-xl font-semibold text-gray-400">/month</span>
            </p>
            <p className="mt-6 text-gray-400">Unlimited power for serious SaaS builders.</p>

            <ul className="mt-6 space-y-4">
              <li className="flex text-gray-300">
                <Check className="flex-shrink-0 w-6 h-6 text-[#00d4ff]" />
                <span className="ml-3">Unlimited Generations</span>
              </li>
              <li className="flex text-gray-300">
                <Check className="flex-shrink-0 w-6 h-6 text-[#00d4ff]" />
                <span className="ml-3">Premium AI Models (GPT-4)</span>
              </li>
              <li className="flex text-gray-300">
                <Check className="flex-shrink-0 w-6 h-6 text-[#00d4ff]" />
                <span className="ml-3">Priority Support</span>
              </li>
              <li className="flex text-gray-300">
                <Check className="flex-shrink-0 w-6 h-6 text-[#00d4ff]" />
                <span className="ml-3">Custom Domains</span>
              </li>
            </ul>
          </div>
          <div className="mt-8">
            <button
              onClick={() => handleSubscribe('PRO')}
              className="block w-full py-3 px-4 bg-[#00d4ff] hover:bg-[#00b3d6] rounded-md text-center font-bold text-black transition-colors"
            >
              Subscribe Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
