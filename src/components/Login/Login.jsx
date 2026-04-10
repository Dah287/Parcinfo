// components/Login/Login.jsx
import React, { useState, useEffect } from 'react';
import { 
  FiLogIn, 
  FiHash, 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiAlertCircle,
  FiShield,
  FiCheckCircle,
  FiLoader,
  FiUserCheck,
  FiDatabase,
  FiUserPlus
} from 'react-icons/fi';
import { login, setUserSession, getCurrentUser } from '../../services/authService';

const Login = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    matricule: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);

  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser && onLoginSuccess) {
      onLoginSuccess(currentUser);
    }
  }, []);

  // Timer pour déverrouillage après 3 tentatives échouées
  useEffect(() => {
    let timer;
    if (isLocked && lockTimer > 0) {
      timer = setInterval(() => {
        setLockTimer(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            setLoginAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLocked, lockTimer]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.matricule.trim()) {
      setError('Veuillez saisir votre matricule');
      return false;
    }
    if (!formData.password) {
      setError('Veuillez saisir votre mot de passe');
      return false;
    }
    return true;
  };

  // Login.jsx - Version avec débogage
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (isLocked) {
    setError(`Trop de tentatives. Veuillez réessayer dans ${lockTimer} secondes.`);
    return;
  }
  
  if (!validateForm()) return;

  setLoading(true);
  setError('');
  setSuccessMessage('');

  try {
    console.log("Appel API login avec:", formData.matricule);
    
    // Appel API réel
    const response = await login(
      formData.matricule, 
      formData.password, 
      formData.rememberMe
    );
    
    console.log("Réponse API complète:", response);
    console.log("Données de réponse:", response.data);
    
    if (response.data && response.data.token) {
      console.log("Token reçu, traitement des données...");
      
      // Extraire les données utilisateur
      const userData = {
        id: response.data.id,
        matricule: response.data.matricule,
        nom: response.data.nom,
        prenom: response.data.prenom,
        email: response.data.email,
        role: response.data.role,
        permissions: response.data.permissions || [],
        token: response.data.token
      };
      
      console.log("UserData à stocker:", userData);
      
      // Stocker les informations utilisateur
      setUserSession(userData, formData.rememberMe);
      
      setSuccessMessage('Connexion réussie ! Redirection en cours...');
      setLoginAttempts(0);
      
      // Attendre un peu puis rediriger
setTimeout(() => {
  console.log("Appel de onLoginSuccess avec:", userData);
  if (onLoginSuccess) {
    onLoginSuccess(userData); // Le rôle est déjà dans userData
  }
}, 1500);
    } else {
      console.error("Pas de token dans la réponse:", response.data);
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        setIsLocked(true);
        setLockTimer(30);
        setError('Trop de tentatives échouées. Veuillez réessayer dans 30 secondes.');
      } else {
        setError(`Matricule ou mot de passe incorrect. Tentative ${newAttempts}/3`);
      }
      setLoading(false);
    }
  } catch (err) {
    console.error('Erreur détaillée de connexion:', err);
    console.error('Response error:', err.response);
    console.error('Message error:', err.message);
    
    const newAttempts = loginAttempts + 1;
    setLoginAttempts(newAttempts);
    
    if (newAttempts >= 3) {
      setIsLocked(true);
      setLockTimer(30);
      setError('Trop de tentatives échouées. Veuillez réessayer dans 30 secondes.');
    } else {
      const errorMessage = err.response?.data?.message || err.message || 'Matricule ou mot de passe incorrect';
      setError(`${errorMessage}. Tentative ${newAttempts}/3`);
    }
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="inline-flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 w-20 h-20 rounded-2xl shadow-2xl mb-4">
            <FiDatabase className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">GestionParcInfo</h2>
          <p className="text-blue-200 text-sm">Système de gestion de parc informatique</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 animate-fade-in-up">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <FiLogIn className="mr-2" />
              Connexion
            </h3>
            <p className="text-blue-100 text-sm mt-1">
              Accédez à votre espace de travail
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Matricule <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiHash className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="matricule"
                  value={formData.matricule}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    error && !formData.matricule ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Entrez votre matricule"
                  disabled={loading || isLocked}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    error && !formData.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                  disabled={loading || isLocked}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  disabled={loading || isLocked}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={loading || isLocked}
                />
                <span className="text-sm text-gray-600">Se souvenir de moi</span>
              </label>
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                onClick={() => alert('Contactez votre administrateur pour réinitialiser votre mot de passe.')}
              >
                Mot de passe oublié ?
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg animate-shake">
                <div className="flex items-center">
                  <FiAlertCircle className="text-red-500 mr-2 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-lg animate-fade-in">
                <div className="flex items-center">
                  <FiCheckCircle className="text-green-500 mr-2 flex-shrink-0" />
                  <p className="text-sm text-green-700">{successMessage}</p>
                </div>
              </div>
            )}

            {isLocked && lockTimer > 0 && (
              <div className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded-lg">
                <div className="flex items-center">
                  <FiLoader className="animate-spin text-orange-500 mr-2" />
                  <p className="text-sm text-orange-700">
                    Compte temporairement verrouillé. Réessayez dans {lockTimer} secondes.
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || isLocked}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <FiLoader className="animate-spin mr-2" />
                  Connexion en cours...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <FiLogIn className="mr-2" />
                  Se connecter
                </span>
              )}
            </button>

            {/* <div className="text-center pt-2">
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center gap-2 w-full"
              >
                <FiUserPlus size={16} />
                Pas encore de compte ? S'inscrire
              </button>
            </div> */}
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-blue-200 text-xs flex items-center justify-center">
            <FiShield className="mr-1" size={12} />
            Sécurisé par GestionParcInfo © 2026
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-fade-in-down { animation: fade-in-down 0.5s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out; }
        .animate-shake { animation: shake 0.3s ease-in-out; }
        .animate-fade-in { animation: fade-in-up 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default Login;