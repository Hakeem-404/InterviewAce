import React from 'react';

const BoltBadge: React.FC = () => {
  return (
    <a 
      href="https://bolt.new" 
      target="_blank" 
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
      title="Built with Bolt.new"
    >
      <img 
        src="https://raw.githubusercontent.com/kickiniteasy/bolt-hackathon-badge/main/src/public/bolt-badge/black_circle_360x360/black_circle_360x360.svg" 
        alt="Bolt.new" 
        className="w-full h-full"
      />
    </a>
  );
};

export default BoltBadge;