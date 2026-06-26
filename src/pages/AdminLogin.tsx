import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { showToast } from '@/components/ui/Toast';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('admin_pin_verified');
    if (stored === 'true') navigate('/admin');
  }, [navigate]);

  const handleSubmit = async () => {
    if (pin.length < 4) {
      showToast('Enter a valid PIN', 'error');
      return;
    }
    setLoading(true);

    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'admin_pin')
      .single();

    if (data?.value === pin) {
      sessionStorage.setItem('admin_pin_verified', 'true');
      showToast('Access granted', 'success');
      navigate('/admin');
    } else {
      showToast('Invalid PIN', 'error');
      setPin('');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-gold" />
          </div>
          <h1 className="font-serif text-2xl text-navy mb-1">Admin Access</h1>
          <p className="text-sm text-gray-500">Aura & Anchor Collections</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Enter PIN</label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                maxLength={20}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gold pr-10"
              />
              <button
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gold text-navy py-3 rounded-lg font-medium hover:bg-gold-600 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-navy border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              'Access Dashboard'
            )}
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full py-2 text-sm text-gray-500 hover:text-navy transition-colors"
          >
            Back to Website
          </button>
        </div>
      </div>
    </div>
  );
}
