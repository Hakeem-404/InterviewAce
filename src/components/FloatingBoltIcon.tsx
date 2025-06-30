import React from 'react';
import { Zap } from 'lucide-react';

interface FloatingBoltIconProps {
  className?: string;
}

const FloatingBoltIcon: React.FC<FloatingBoltIconProps> = ({ className = '' }) => {
  return (
    <a
      href="https://bolt.new"
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-6 right-6 p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 ${className}`}
      title="Built with Bolt.new"
    >
      <Zap className="h-6 w-6 text-white" />
    </a>
  );
};

export default FloatingBoltIcon;