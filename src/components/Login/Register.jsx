// components/Register/Register.jsx
import React, { useState } from 'react';
import { 
  FiUserPlus, 
  FiUser, 
  FiMail, 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiAlertCircle,
  FiCheckCircle,
  FiLoader,
  FiShield,
  FiDatabase,
  FiHash,
  FiPhone,
  FiArrowLeft,
  FiCheck,
  FiX
} from 'react-icons/fi';
import { register } from '../../services/authService';
import { toast } from 'react-toastify';

const Register = ({ onSwitchToLogin, onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    matricule: '',
    password: '',
    confirmPassword: '',
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    role: 'USER'
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  
  // État pour la force du mot de passe
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    level: '',
    color: '',
    requirements: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false
    }
  });

  // Fonction pour vérifier la force du mot de passe
  const checkPasswordStrength = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    let score = 0;
    Object.values(requirements).forEach(req => {
      if (req) score++;
    });
    
    let level = '';
    let color = '';
    
    if (score === 0 || score === 1) {
      level = 'Très faible';
      color = 'red';
    } else if (score === 2) {
      level = 'Faible';
      color = 'orange';
    } else if (score === 3) {
      level = 'Moyenne';
      color = 'yellow';
    } else if (score === 4) {
      level = 'Forte';
      color = 'lightgreen';
    } else if (score === 5) {
      level = 'Très forte';
      color = 'green';
    }
    
    setPasswordStrength({
      score,
      level,
      color,
      requirements
    });
    
    return score;
  };

  // Validation des champs avec force du mot de passe
  const validateForm = () => {
    const newErrors = {};
    
    // Validation matricule
    if (!formData.matricule.trim()) {
      newErrors.matricule = 'Le matricule est requis';
    } else if (formData.matricule.length < 3) {
      newErrors.matricule = 'Le matricule doit contenir au moins 3 caractères';
    } else if (!/^[A-Z0-9]+$/i.test(formData.matricule)) {
      newErrors.matricule = 'Le matricule ne doit contenir que des lettres et chiffres';
    }
    
    // Validation nom
    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    } else if (formData.nom.length < 2) {
      newErrors.nom = 'Le nom doit contenir au moins 2 caractères';
    }
    
    // Validation prénom
    if (!formData.prenom.trim()) {
      newErrors.prenom = 'Le prénom est requis';
    } else if (formData.prenom.length < 2) {
      newErrors.prenom = 'Le prénom doit contenir au moins 2 caractères';
    }
    
    // Validation email
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
      newErrors.email = 'Email invalide (exemple: nom@domaine.com)';
    }
    
    // Validation téléphone (optionnel)
    if (formData.telephone && !/^[0-9+\s]{10,15}$/.test(formData.telephone)) {
      newErrors.telephone = 'Numéro de téléphone invalide (10-15 chiffres)';
    }
    
    // Validation mot de passe avec force
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    } else {
      const strength = checkPasswordStrength(formData.password);
      if (strength < 3) {
        newErrors.password = `Mot de passe ${passwordStrength.level.toLowerCase()}. Utilisez au moins 8 caractères avec majuscules, minuscules, chiffres et caractères spéciaux.`;
      }
    }
    
    // Validation confirmation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Vérifier la force du mot de passe en temps réel
    if (name === 'password') {
      checkPasswordStrength(value);
    }
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setErrors({});
    setSuccessMessage('');
    
    try {
      const registerData = {
        matricule: formData.matricule,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone || null,
        role: formData.role
      };
      
      console.log("Tentative d'inscription:", registerData.matricule);
      
      const response = await register(registerData);
      
      console.log("Réponse inscription:", response.data);
      
      setSuccessMessage('Inscription réussie ! Redirection vers la connexion...');
      
      setTimeout(() => {
        if (onRegisterSuccess) {
          onRegisterSuccess();
        } else if (onSwitchToLogin) {
          onSwitchToLogin();
        }
      }, 2000);
      
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      
      if (error.response?.data?.message) {
        const backendMessage = error.response.data.message;
        
        if (backendMessage.toLowerCase().includes('matricule')) {
          setErrors({ matricule: backendMessage });
        } else if (backendMessage.toLowerCase().includes('email')) {
          setErrors({ email: backendMessage });
        } else {
          toast.error(backendMessage);
        }
      } else if (error.response?.data?.errors) {
        const fieldErrors = {};
        error.response.data.errors.forEach(err => {
          fieldErrors[err.field] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        toast.error('Erreur lors de l\'inscription. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Composant d'indicateur de force du mot de passe
  const PasswordStrengthIndicator = () => {
    const { score, level, color, requirements } = passwordStrength;
    
    const getColorClass = () => {
      switch(color) {
        case 'red': return 'bg-red-500';
        case 'orange': return 'bg-orange-500';
        case 'yellow': return 'bg-yellow-500';
        case 'lightgreen': return 'bg-green-300';
        case 'green': return 'bg-green-500';
        default: return 'bg-gray-300';
      }
    };
    
    const getTextColorClass = () => {
      switch(color) {
        case 'red': return 'text-red-600';
        case 'orange': return 'text-orange-600';
        case 'yellow': return 'text-yellow-600';
        case 'lightgreen': return 'text-green-600';
        case 'green': return 'text-green-600';
        default: return 'text-gray-600';
      }
    };
    
    if (!formData.password) return null;
    
    return (
      <div className="mt-2 space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${getColorClass()}`}
              style={{ width: `${(score / 5) * 100}%` }}
            />
          </div>
          <span className={`text-xs font-medium ${getTextColorClass()}`}>
            {level}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className={`flex items-center gap-1 ${requirements.length ? 'text-green-600' : 'text-gray-400'}`}>
            {requirements.length ? <FiCheck size={12} /> : <FiX size={12} />}
            <span>8+ caractères</span>
          </div>
          <div className={`flex items-center gap-1 ${requirements.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
            {requirements.uppercase ? <FiCheck size={12} /> : <FiX size={12} />}
            <span>Majuscule</span>
          </div>
          <div className={`flex items-center gap-1 ${requirements.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
            {requirements.lowercase ? <FiCheck size={12} /> : <FiX size={12} />}
            <span>Minuscule</span>
          </div>
          <div className={`flex items-center gap-1 ${requirements.number ? 'text-green-600' : 'text-gray-400'}`}>
            {requirements.number ? <FiCheck size={12} /> : <FiX size={12} />}
            <span>Chiffre</span>
          </div>
          <div className={`flex items-center gap-1 col-span-2 ${requirements.special ? 'text-green-600' : 'text-gray-400'}`}>
            {requirements.special ? <FiCheck size={12} /> : <FiX size={12} />}
            <span>Caractère spécial (!@#$%^&*)</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-lg">
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="inline-flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 w-20 h-20 rounded-2xl shadow-2xl mb-4">
            <FiDatabase className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">GestionParcInfo</h2>
          <p className="text-blue-200 text-sm">Créer un nouveau compte</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 animate-fade-in-up">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <FiUserPlus className="mr-2" />
              Inscription
            </h3>
            <p className="text-blue-100 text-sm mt-1">
              Créez votre compte pour accéder à l'application
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Ligne 1: Nom et Prénom */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Nom <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      errors.nom ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Dupont"
                    disabled={loading}
                  />
                </div>
                {errors.nom && (
                  <p className="text-xs text-red-500 mt-1 flex items-center">
                    <FiAlertCircle className="mr-1" size={12} /> {errors.nom}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      errors.prenom ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Jean"
                    disabled={loading}
                  />
                </div>
                {errors.prenom && (
                  <p className="text-xs text-red-500 mt-1 flex items-center">
                    <FiAlertCircle className="mr-1" size={12} /> {errors.prenom}
                  </p>
                )}
              </div>
            </div>

            {/* Matricule */}
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
                    errors.matricule ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="USER001"
                  disabled={loading}
                />
              </div>
              {errors.matricule && (
                <p className="text-xs text-red-500 mt-1 flex items-center">
                  <FiAlertCircle className="mr-1" size={12} /> {errors.matricule}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="jean.dupont@example.com"
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1 flex items-center">
                  <FiAlertCircle className="mr-1" size={12} /> {errors.email}
                </p>
              )}
            </div>

            {/* Téléphone (optionnel) */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Téléphone <span className="text-gray-400 text-xs">(optionnel)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiPhone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.telephone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0612345678"
                  disabled={loading}
                />
              </div>
              {errors.telephone && (
                <p className="text-xs text-red-500 mt-1 flex items-center">
                  <FiAlertCircle className="mr-1" size={12} /> {errors.telephone}
                </p>
              )}
            </div>

            {/* Mot de passe avec indicateur de force */}
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
                    errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              
              {/* Indicateur de force du mot de passe */}
              <PasswordStrengthIndicator />
              
              {errors.password && (
                <p className="text-xs text-red-500 mt-1 flex items-center">
                  <FiAlertCircle className="mr-1" size={12} /> {errors.password}
                </p>
              )}
            </div>

            {/* Confirmation mot de passe */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Confirmer le mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1 flex items-center">
                  <FiAlertCircle className="mr-1" size={12} /> {errors.confirmPassword}
                </p>
              )}
            </div>

            {successMessage && (
              <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-lg animate-fade-in">
                <div className="flex items-center">
                  <FiCheckCircle className="text-green-500 mr-2 flex-shrink-0" />
                  <p className="text-sm text-green-700">{successMessage}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <FiLoader className="animate-spin mr-2" />
                  Inscription en cours...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <FiUserPlus className="mr-2" />
                  S'inscrire
                </span>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center gap-2 w-full"
              >
                <FiArrowLeft size={16} />
                Déjà un compte ? Se connecter
              </button>
            </div>
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
        .animate-fade-in-down { animation: fade-in-down 0.5s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out; }
        .animate-fade-in { animation: fade-in-up 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default Register;