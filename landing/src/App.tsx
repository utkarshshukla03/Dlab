import React, { useState } from 'react';
import { 
  Wallet, 
  Shield, 
  Zap, 
  BarChart3, 
  Smile, 
  Users, 
  Upload, 
  Coins, 
  Vote, 
  Github, 
  Twitter, 
  MessageSquare,
  Lock,
  Database,
  Layers,
  Settings,
  Network,
  CreditCard,
  FileText,
  Code,
  Menu,
  X
} from 'lucide-react';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const FeatureCard = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 hover:border-purple-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl group">
      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );

  const TechBadge = ({ icon: Icon, name, delay }: { icon: any; name: string; delay: string }) => (
    <div 
      className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl border border-gray-700 flex items-center space-x-3 hover:border-purple-500 transition-all duration-300"
    >
      <Icon className="w-6 h-6 text-purple-400" />
      <span className="text-white font-medium">{name}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-gray-900/80 backdrop-blur-md border-b border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="text-xl font-bold">DLab</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#tech" className="text-gray-300 hover:text-white transition-colors">Tech Stack</a>
              <a href="#docs" className="text-gray-300 hover:text-white transition-colors">Docs</a>
            </div>

            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-gray-900 border-t border-gray-800">
            <div className="px-4 py-2 space-y-2">
              <a href="#features" className="block py-2 text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#tech" className="block py-2 text-gray-300 hover:text-white transition-colors">Tech Stack</a>
              <a href="#docs" className="block py-2 text-gray-300 hover:text-white transition-colors">Docs</a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              DLab: Decentralized Data Tasks, Real Crypto Rewards
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
              Bridge the gap between organizations and users through Web3 micro-tasks and Solana-based payments.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="https://dlab-user.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-purple-500 to-blue-500 px-12 py-4 rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 glow-button transform hover:scale-105 shadow-2xl text-center inline-block"
              >
                For Organizations
              </a>
              <a 
                href="https://dlab-worker.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-blue-500 to-purple-500 px-12 py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 glow-button transform hover:scale-105 shadow-2xl text-center inline-block"
              >
                For Users
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Organizations */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl border border-gray-700 hover:border-purple-500 transition-all duration-300">
              <div className="flex items-center mb-6">
                <Users className="w-8 h-8 text-purple-400 mr-3" />
                <h3 className="text-2xl font-semibold">For Organizations</h3>
              </div>
              <p className="text-xl text-purple-400 mb-8">Post a Task. Get Real Insights.</p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-semibold mb-1">Upload image(s) + task title</h4>
                    <p className="text-gray-400 text-sm">Simple interface to create your data collection task</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-semibold mb-1">Add bounty in Solana (micro-payments per vote)</h4>
                    <p className="text-gray-400 text-sm">Set competitive rewards to attract quality participants</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <h4 className="font-semibold mb-1">Track live statistics as users complete tasks</h4>
                    <p className="text-gray-400 text-sm">Real-time dashboard with progress and analytics</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-300">
                  <Shield className="w-4 h-4 inline mr-2 text-green-400" />
                  All transactions are secure on Solana blockchain.
                </p>
              </div>
            </div>

            {/* Users */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl border border-gray-700 hover:border-blue-500 transition-all duration-300">
              <div className="flex items-center mb-6">
                <Coins className="w-8 h-8 text-blue-400 mr-3" />
                <h3 className="text-2xl font-semibold">For Users</h3>
              </div>
              <p className="text-xl text-blue-400 mb-8">Earn by Participating</p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-semibold mb-1">Complete simple annotation or voting tasks</h4>
                    <p className="text-gray-400 text-sm">Easy tasks that take just a few seconds</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-semibold mb-1">Choose 1 image per task (counts as a vote)</h4>
                    <p className="text-gray-400 text-sm">Simple selection process with clear instructions</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <h4 className="font-semibold mb-1">Earn instant crypto rewards</h4>
                    <p className="text-gray-400 text-sm">Immediate payments to your wallet upon completion</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Features
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Wallet}
              title="Universal Wallet Compatibility"
              description="No need to switch wallets or chains — Solana native & compatible with Phantom."
            />
            
            <FeatureCard 
              icon={Zap}
              title="Gasless Micro-Payments"
              description="No native tokens needed — transactions are handled through one seamless pool."
            />
            
            <FeatureCard 
              icon={BarChart3}
              title="Real-Time Stats"
              description="Live overview of task progress, response rates, and voting distribution."
            />
            
            <FeatureCard 
              icon={Smile}
              title="Seedless Onboarding"
              description="Easy login with just connecting wallet — no complex seed phrases required."
            />
            
            <FeatureCard 
              icon={Shield}
              title="Community Verified"
              description="DLab is decentralized, audited, and community-trusted."
            />
            
            <FeatureCard 
              icon={Lock}
              title="Secure & Transparent"
              description="All transactions and data are secured on blockchain with full transparency."
            />
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="tech" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Tech Stack
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <TechBadge icon={Coins} name="Solana Blockchain" delay="" />
            <TechBadge icon={Database} name="Decentralized Storage" delay="" />
            <TechBadge icon={FileText} name="Web3 Js" delay="" />
            <TechBadge icon={Lock} name="Token Gating" delay="" />
            <TechBadge icon={Wallet} name="Wallet Connect" delay="" />
            <TechBadge icon={CreditCard} name="Micro-payment Engine" delay="" />
            <TechBadge icon={Code} name="React + Tailwind" delay="" />
            <TechBadge icon={Network} name="Prisma" delay="" />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-blue-900/20"></div>
        
        {/* Background floating elements */}
        <div className="absolute top-1/2 left-1/6 opacity-20">
          <BarChart3 className="w-16 h-16 text-purple-400 animate-pulse" />
        </div>
        <div className="absolute top-10 right-1/4 opacity-20">
          <Zap className="w-12 h-12 text-blue-400 animate-pulse" />
        </div>
        <div className="absolute bottom-10 left-1/3 opacity-20">
          <Shield className="w-14 h-14 text-green-400 animate-pulse" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Ready to Earn or Get Feedback with DLab?
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="http://localhost:3001" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-purple-500 to-blue-500 px-12 py-5 rounded-xl font-semibold text-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-300 glow-button transform hover:scale-105 shadow-2xl text-center inline-block"
            >
              Start as Organization
            </a>
            <a 
              href="http://localhost:3002" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-blue-500 to-purple-500 px-12 py-5 rounded-xl font-semibold text-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 glow-button transform hover:scale-105 shadow-2xl text-center inline-block"
            >
              Start as User
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">D</span>
                </div>
                <span className="text-xl font-bold">DLab</span>
              </div>
              <p className="text-gray-400 text-sm">
                Decentralized platform for Web3 data tasks and crypto rewards.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Explore</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">How it Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Docs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center mt-8 pt-8 border-t border-gray-800">
            <p className="text-gray-400 text-sm">
              © 2025 DLab. All rights reserved.
            </p>
            
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <MessageSquare className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;