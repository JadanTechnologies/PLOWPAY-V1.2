


import React from 'react';
import Icon from '/components/icons/index.tsx';
import { View } from '../App';
import { useAppContext } from '../hooks/useAppContext';
import { useCurrency } from '../hooks/useCurrency';


interface LandingPageProps {
  onNavigate: (view: View) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { brandConfig, subscriptionPlans } = useAppContext();
  const { formatCurrency } = useCurrency();

  const features = [
    {
      icon: 'pos',
      title: 'Intuitive Point of Sale',
      description: 'A fast, easy-to-use POS system that works on any device. Speed up checkouts and keep lines moving.',
    },
    {
      icon: 'inventory',
      title: 'Real-time Inventory',
      description: 'Track stock levels across all your branches in real-time. Get low-stock alerts and never miss a sale.',
    },
    {
      icon: 'trending-up',
      title: 'Powerful Analytics',
      description: 'Make data-driven decisions with comprehensive reports on sales, products, and branch performance.',
    },
    {
      icon: 'briefcase',
      title: 'Multi-Branch Sync',
      description: 'Manage products, stock, and staff seamlessly across multiple locations from one central dashboard.',
    },
  ];

  return (
    <div className="bg-gray-900 text-gray-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              {brandConfig.logoUrl ? (
                <img src={brandConfig.logoUrl} alt={`${brandConfig.name} Logo`} className="h-8 w-auto" />
              ) : (
                <svg className="w-8 h-8 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.825-1.106-2.156 0-2.981.54-.403 1.25-.624 1.968-.624a4.58 4.58 0 0 1 .844.119" />
                </svg>
              )}
              <span className="ml-2 text-2xl font-bold text-white">{brandConfig.name}</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="hover:text-indigo-400 transition-colors">Features</a>
              <a href="#pricing" className="hover:text-indigo-400 transition-colors">Pricing</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('faq'); }} className="hover:text-indigo-400 transition-colors">FAQs</a>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={() => onNavigate('login')} className="text-gray-300 hover:text-white transition-colors">Log In</button>
              <button onClick={() => onNavigate('signup')} className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-indigo-500 transition-colors">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 sm:py-28 text-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
              The All-in-One Platform to
              <span className="block text-indigo-400">Run Your Retail Business</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-400">
              From point of sale to inventory management, {brandConfig.name} provides the tools you need to streamline operations, delight customers, and grow your business.
            </p>
            <div className="mt-8 flex justify-center">
              <button onClick={() => onNavigate('signup')} className="bg-indigo-600 text-white font-semibold px-6 py-3 rounded-md hover:bg-indigo-500 transition-transform transform hover:scale-105">
                Get Started for Free
              </button>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-950">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white">Everything You Need to Sell</h2>
              <p className="mt-4 text-lg text-gray-400">{brandConfig.name} is packed with powerful features to manage your entire business.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-gray-800 p-6 rounded-lg">
                  <div className="bg-indigo-600/20 text-indigo-400 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                    <Icon name={feature.icon} className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white">Simple, Transparent Pricing</h2>
              <p className="mt-4 text-lg text-gray-400">Choose the plan that's right for your business. No hidden fees.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {subscriptionPlans.map((plan) => (
                <div key={plan.id} className={`bg-gray-800 p-8 rounded-lg border-2 ${plan.recommended ? 'border-indigo-500' : 'border-gray-700'} relative flex flex-col`}>
                  {plan.recommended && <span className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Recommended</span>}
                  <h3 className="text-2xl font-semibold text-white">{plan.name}</h3>
                  <p className="text-gray-400 mt-2 h-10">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-5xl font-extrabold text-white">{formatCurrency(plan.price).replace(/\.00$/, '')}</span>
                    <span className="text-lg text-gray-400">/mo</span>
                  </div>
                  <ul className="mt-6 space-y-3 text-gray-400 flex-grow">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => onNavigate('signup')} className={`w-full mt-8 py-3 px-6 rounded-lg font-semibold transition-colors ${plan.recommended ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>
                    Choose Plan
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-gray-950">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl font-bold text-white">Loved by Businesses Like Yours</h2>
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <p className="text-gray-300">"{brandConfig.name} has been a game-changer for our inventory management. We've reduced stockouts by 40% and can finally trust our numbers."</p>
                        <div className="flex items-center mt-4">
                            <img className="w-12 h-12 rounded-full mr-4" src="https://picsum.photos/seed/person1/100" alt="Sarah L."/>
                            <div>
                                <p className="font-semibold text-white">Sarah L.</p>
                                <p className="text-sm text-gray-400">Owner, The Boutique Hub</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <p className="text-gray-300">"The POS is incredibly fast and intuitive. Our staff training time was cut in half compared to our old system. Highly recommended!"</p>
                         <div className="flex items-center mt-4">
                            <img className="w-12 h-12 rounded-full mr-4" src="https://picsum.photos/seed/person2/100" alt="Mike R."/>
                            <div>
                                <p className="font-semibold text-white">Mike R.</p>
                                <p className="text-sm text-gray-400">Manager, Gadget World</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <p className="text-gray-300">"As a multi-branch business, having a single source of truth for sales and stock is essential. {brandConfig.name} delivers exactly that, beautifully."</p>
                         <div className="flex items-center mt-4">
                            <img className="w-12 h-12 rounded-full mr-4" src="https://picsum.photos/seed/person3/100" alt="Chen W."/>
                            <div>
                                <p className="font-semibold text-white">Chen W.</p>
                                <p className="text-sm text-gray-400">COO, Urban Eats</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
                <h4 className="font-semibold text-white">Product</h4>
                <ul className="mt-4 space-y-2">
                    <li><a href="#features" className="text-gray-400 hover:text-white">Features</a></li>
                    <li><a href="#pricing" className="text-gray-400 hover:text-white">Pricing</a></li>
                    <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('faq'); }} className="text-gray-400 hover:text-white">FAQs</a></li>
                </ul>
            </div>
            <div>
                <h4 className="font-semibold text-white">Company</h4>
                <ul className="mt-4 space-y-2">
                    <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('about'); }} className="text-gray-400 hover:text-white">About</a></li>
                    <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('contact'); }} className="text-gray-400 hover:text-white">Contact</a></li>
                </ul>
            </div>
             <div>
                <h4 className="font-semibold text-white">Resources</h4>
                <ul className="mt-4 space-y-2">
                    <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('blog'); }} className="text-gray-400 hover:text-white">Blog</a></li>
                    <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('help'); }} className="text-gray-400 hover:text-white">Help Center</a></li>
                    <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('api'); }} className="text-gray-400 hover:text-white">API Docs</a></li>
                </ul>
            </div>
             <div>
                <h4 className="font-semibold text-white">Legal</h4>
                <ul className="mt-4 space-y-2">
                    <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('privacy'); }} className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                    <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('terms'); }} className="text-gray-400 hover:text-white">Terms of Service</a></li>
                    <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('refund'); }} className="text-gray-400 hover:text-white">Refund Policy</a></li>
                </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-500">&copy; {new Date().getFullYear()} {brandConfig.name}, Inc. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 sm:mt-0">
                <a href="#" className="text-gray-500 hover:text-white"><Icon name="twitter" className="w-5 h-5" /></a>
                <a href="#" className="text-gray-500 hover:text-white"><Icon name="linkedin" className="w-5 h-5" /></a>
                <a href="#" className="text-gray-500 hover:text-white"><Icon name="facebook" className="w-5 h-5" /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;