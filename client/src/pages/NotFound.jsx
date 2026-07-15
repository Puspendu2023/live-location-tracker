import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-9xl mb-4"
        >
          📍
        </motion.div>
        
        <h1 className="text-8xl font-bold text-white mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-white mb-4">
          Location Not Found
        </h2>
        <p className="text-white/80 mb-8 max-w-md">
          Oops! The page you're looking for seems to be off the map.
          Let's get you back on track.
        </p>
        
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-xl"
        >
          <FiHome size={24} />
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;