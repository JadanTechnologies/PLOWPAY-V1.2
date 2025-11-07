import React, { useState } from 'react';
import Icon from './icons/index.tsx';
import { View } from '../App';
import { useAppContext } from '../hooks/useAppContext';
import { useCurrency } from '../hooks/useCurrency';

interface LandingPageProps {
  onNavigate: (view: View) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { brandConfig, subscriptionPlans, systemSettings } = useAppContext();
  const { formatCurrency } = useCurrency();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const { businesses, users, revenue } = systemSettings.landingPageMetrics;

  const features = [
    { icon: 'pos', title: 'Intuitive Point of Sale', description: 'A fast, easy-to-use POS system that works on any device.' },
    { icon: 'inventory', title: 'Real-time Inventory', description: 'Track stock levels across all your branches in real-time.' },
    { icon: 'trending-up', title: 'Powerful Analytics', description: 'Make data-driven decisions with comprehensive reports.' },
    { icon: 'briefcase', title: 'Multi-Branch Sync', description: 'Manage products, stock, and staff seamlessly across locations.' },
  ];

  return (
    <div className="bg-slate-50 text-slate-700 antialiased">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('landing'); }} className="flex items-center">
              {brandConfig.logoUrl ? (
                <img src={brandConfig.logoUrl} alt={`${brandConfig.name} Logo`} className="h-8 w-auto" />
              ) : (
                <svg className="w-8 h-8 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.825-1.106-2.156 0-2.981.54-.403 1.25-.624 1.968-.624a4.58 4.58 0 0 1 .844.119" />
                </svg>
              )}
              <span className="ml-2 text-2xl font-bold text-slate-800">{brandConfig.name}</span>
            </a>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="hover:text-cyan-600 transition-colors">Features</a>
              <a href="#pricing" className="hover:text-cyan-600 transition-colors">Pricing</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('faq'); }} className="hover:text-cyan-600 transition-colors">FAQs</a>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={() => onNavigate('login')} className="text-slate-600 hover:text-slate-900 transition-colors font-semibold">Log In</button>
              <button onClick={() => onNavigate('signup')} className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold px-4 py-2 rounded-md hover:from-cyan-600 hover:to-teal-600 transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="relative pt-20 pb-24 sm:pt-28 sm:pb-32">
            <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
                <div className="text-center lg:text-left">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight">
                        The Future of Retail is
                        <span className="block bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent">Flowing with Ease</span>
                    </h1>
                    <p className="mt-6 max-w-xl mx-auto lg:mx-0 text-lg text-slate-600">
                      From point of sale to inventory management, {brandConfig.name} provides the tools you need to streamline operations, delight customers, and grow your business.
                    </p>
                    <div className="mt-8 flex justify-center lg:justify-start gap-4">
                        <button onClick={() => onNavigate('signup')} className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold px-6 py-3 rounded-lg hover:from-cyan-600 hover:to-teal-600 transition-transform transform hover:scale-105 shadow-lg shadow-cyan-500/30">
                            Start 14-Day Free Trial
                        </button>
                    </div>
                </div>
                <div className="hidden lg:block">
                  <img src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="POS System" className="rounded-2xl shadow-2xl aspect-video object-cover" />
                </div>
            </div>
        </section>

        <section className="py-16 bg-slate-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-8 bg-white rounded-xl shadow-lg">
                <h3 className="text-5xl font-extrabold bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent">{businesses.value.toLocaleString()}+</h3>
                <p className="mt-2 text-lg font-medium text-slate-600">{businesses.label}</p>
              </div>
              <div className="p-8 bg-white rounded-xl shadow-lg">
                <h3 className="text-5xl font-extrabold bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent">{users.value.toLocaleString()}+</h3>
                <p className="mt-2 text-lg font-medium text-slate-600">{users.label}</p>
              </div>
              <div className="p-8 bg-white rounded-xl shadow-lg">
                <h3 className="text-5xl font-extrabold bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent">${revenue.value}M+</h3>
                <p className="mt-2 text-lg font-medium text-slate-600">{revenue.label}</p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900">Everything You Need to Sell</h2>
              <p className="mt-4 text-lg text-slate-600">Packed with powerful features to manage your entire business.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
                  <div className="bg-gradient-to-br from-cyan-100 to-teal-100 text-cyan-600 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                    <Icon name={feature.icon} className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20 bg-slate-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
             <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900">Simple, Transparent Pricing</h2>
              <p className="mt-4 text-lg text-slate-600">Choose the plan that's right for your business. No hidden fees.</p>
              <div className="mt-6 inline-flex items-center bg-slate-200 p-1 rounded-full text-sm font-semibold">
                <button onClick={() => setBillingCycle('monthly')} className={`px-4 py-1.5 rounded-full transition-colors ${billingCycle === 'monthly' ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow' : 'text-slate-600'}`}>Monthly</button>
                <button onClick={() => setBillingCycle('yearly')} className={`px-4 py-1.5 rounded-full transition-colors relative ${billingCycle === 'yearly' ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow' : 'text-slate-600'}`}>
                    Yearly <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Save 20%</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {subscriptionPlans.map((plan) => (
                <div key={plan.id} className={`bg-white p-8 rounded-lg border-2 ${plan.recommended ? 'border-cyan-500' : 'border-slate-200'} relative flex flex-col shadow-lg`}>
                  {plan.recommended && <span className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Recommended</span>}
                  <h3 className="text-2xl font-semibold text-slate-900">{plan.name}</h3>
                  <p className="text-slate-600 mt-2 h-10">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-5xl font-extrabold text-slate-900">{formatCurrency(billingCycle === 'monthly' ? plan.price : plan.priceYearly / 12).replace(/\.00$/, '')}</span>
                    <span className="text-lg text-slate-500">/mo</span>
                    {billingCycle === 'yearly' && <p className="text-sm text-slate-500">Billed as {formatCurrency(plan.priceYearly)} per year</p>}
                  </div>
                  <ul className="mt-6 space-y-3 text-slate-600 flex-grow">
                    {plan.features.map((feature, i) => ( <li key={i} className="flex items-center"><Icon name="check" className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />{feature}</li> ))}
                  </ul>
                  <button onClick={() => onNavigate('signup')} className={`w-full mt-8 py-3 px-6 rounded-lg font-semibold transition-colors ${plan.recommended ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:from-cyan-600 hover:to-teal-600' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'}`}>
                    Choose Plan
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <footer className="bg-slate-100 border-t border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
                <h4 className="font-semibold text-slate-800">Product</h4>
                <ul className="mt-4 space-y-2">
                    <li><a href="#features" className="text-slate-600 hover:text-cyan-600">Features</a></li>
                    <li><a href="#pricing" className="text-slate-600 hover:text-cyan-600">Pricing</a></li>
                    <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('faq'); }} className="text-slate-600 hover:text-cyan-600">FAQs</a></li>
                </ul>
            </div>
            <div>
                <h4 className="font-semibold text-slate-800">Company</h4>
                <ul className="mt-4 space-y-2">
                    <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('about'); }} className="text-slate-600 hover:text-cyan-600">About</a></li>
                    <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('contact'); }} className="text-slate-600 hover:text-cyan-600">Contact</a></li>
                </ul>
            </div>
             <div>
                <h4 className="font-semibold text-slate-800">Resources</h4>
                <ul className="mt-4 space-y-2">
                    <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('blog'); }} className="text-slate-600 hover:text-cyan-600">Blog</a></li>
                    <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('api'); }} className="text-slate-600 hover:text-cyan-600">API Docs</a></li>
                </ul>
            </div>
             <div>
                <h4 className="font-semibold text-slate-800">Legal</h4>
                <ul className="mt-4 space-y-2">
                    <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('privacy'); }} className="text-slate-600 hover:text-cyan-600">Privacy Policy</a></li>
                    <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('terms'); }} className="text-slate-600 hover:text-cyan-600">Terms of Service</a></li>
                    <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('refund'); }} className="text-slate-600 hover:text-cyan-600">Refund Policy</a></li>
                </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-slate-500">&copy; {new Date().getFullYear()} {brandConfig.name}, Inc. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 sm:mt-0">
                <a href="#" className="text-slate-500 hover:text-slate-900"><Icon name="twitter" className="w-5 h-5" /></a>
                <a href="#" className="text-slate-500 hover:text-slate-900"><Icon name="linkedin" className="w-5 h-5" /></a>
                <a href="#" className="text-slate-500 hover:text-slate-900"><Icon name="facebook" className="w-5 h-5" /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
