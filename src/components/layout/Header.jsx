import React, { useState, useEffect } from 'react';
import { FiSearch, FiBell, FiMessageCircle, FiUser, FiMenu, FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Header = ({ onLogout }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Récupérer l'utilisateur à chaque mise à jour du composant
  useEffect(() => {
    const loadUser = () => {
      try {
        const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          console.log("Utilisateur chargé dans Header:", userData);
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'utilisateur:", error);
        setUser(null);
      }
    };

    loadUser();
    
    // Écouter les changements dans le storage (au cas où un autre onglet modifie les données)
    window.addEventListener('storage', loadUser);
    
    return () => {
      window.removeEventListener('storage', loadUser);
    };
  }, []);

  const handleLogout = () => {
    // Appeler la fonction de déconnexion du parent
    if (onLogout) {
      onLogout();
    } else {
      // Fallback si onLogout n'est pas fourni
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
      navigate('/login');
    }
  };

  const handleProfileClick = () => {
    // Navigation vers le profil ou autre action
    console.log('Profil cliqué');
  };

  // Obtenir l'initiale de l'utilisateur
  const getUserInitial = () => {
    if (!user) return 'U';
    return user.prenom?.charAt(0) || user.nom?.charAt(0) || 'U';
  };

  // Obtenir le nom complet de l'utilisateur
  const getUserFullName = () => {
    if (!user) return 'Utilisateur';
    const fullName = `${user.prenom || ''} ${user.nom || ''}`.trim();
    return fullName || 'Utilisateur';
  };

  // Obtenir le rôle de l'utilisateur
  const getUserRole = () => {
    if (!user) return '';
    const role = user.role || '';
    // Traduire le rôle en français si nécessaire
    const roleMap = {
      'ADMIN': 'Administrateur',
      'USER': 'Utilisateur',
      'MANAGER': 'Gestionnaire',
      'TECHNICIEN': 'Technicien'
    };
    return roleMap[role] || role;
  };

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
        
        {/* Menu utilisateur avec déconnexion */}
        <div className="relative">
          <div 
            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 rounded-lg p-2 transition-colors"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold">
                {getUserInitial()}
              </span>
            </div>
            <div className="hidden md:block">
              <span className="text-gray-700 font-medium block text-sm">
                {getUserFullName()}
              </span>
              <span className="text-gray-400 text-xs">
                {getUserRole()}
              </span>
            </div>
            <FiUser size={16} className="text-gray-400 hidden md:block" />
          </div>

          {/* Menu déroulant */}
          {showUserMenu && (
            <>
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 z-50">
                <div className="py-2">
                  {/* Informations utilisateur dans le menu */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">
                      {getUserFullName()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Matricule: {user?.matricule || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Rôle: {getUserRole()}
                    </p>
                  </div>
                  
                  <button
                    onClick={handleProfileClick}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors flex items-center space-x-2"
                  >
                    <FiUser size={16} />
                    <span>Mon profil</span>
                  </button>
                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                  >
                    <FiLogOut size={16} />
                    <span>Déconnexion</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;