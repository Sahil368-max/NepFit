import 'react';
import { Activity, Github, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Brand Info */}
          <div className="flex items-center gap-2 text-orange-500 opacity-90">
            <Activity size={24} strokeWidth={2.5} />
            <span className="text-xl font-black tracking-tight text-white">STRIDE.FIT</span>
          </div>

          {/* Simple Links */}
          <div className="flex gap-6 text-sm font-medium text-gray-400">
            <span className="hover:text-orange-500 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-orange-500 cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-orange-500 cursor-pointer transition-colors">Contact</span>
          </div>

          {/* Social Icons */}
          <div className="flex gap-4">
            <Github className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
            <Twitter className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
            <Mail className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
          </div>

        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Stride Fitness Application. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;