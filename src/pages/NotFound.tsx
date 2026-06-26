import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <h1 className="font-serif text-8xl text-gold mb-4">404</h1>
        <h2 className="font-serif text-2xl text-navy mb-4">Page Not Found</h2>
        <p className="text-gray-500 mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex flex-col gap-3">
          <Link to="/" className="btn-primary">
            Back to Home
          </Link>
          <Link to="/shop" className="flex items-center justify-center gap-2 py-3 border border-gray-200 text-navy hover:border-gold transition-colors">
            <Search className="w-4 h-4" /> Browse Our Collection
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
