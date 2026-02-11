import React, { useState } from 'react';
import { FiSearch, FiBell, FiMessageCircle, FiUser, FiMenu } from 'react-icons/fi';

const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <header className="bg-white shadow-md h-16 flex items-center justify-between px-6">
      <div className="flex items-center">
        <button className="lg:hidden text-gray-600 mr-4">
          <FiMenu size={24} />
        </button>
        <h1 className="text-xl font-bold text-blue-900">GestionParcInfo</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un matériel..." 
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
          <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
        </div>
        
        <button className="p-2 text-gray-600 hover:text-blue-600 relative">
          <FiBell size={20} />
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
        </button>
        
        <button className="p-2 text-gray-600 hover:text-blue-600">
          <FiMessageCircle size={20} />
        </button>
        
        <div className="flex items-center space-x-2">
          <div className="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-bold">M</span>
          </div>
          <span className="text-gray-700 hidden md:block">Marie</span>
        </div>
      </div>
    </header>
  );
};

export default Header;