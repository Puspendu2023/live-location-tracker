import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiShield, FiZap, FiUsers, FiBell, FiTrendingUp } from 'react-icons/fi';

const LandingPage = () => {
  const features = [
    {
      icon: FiMapPin,
      title: 'Real-Time Tracking',
      description: 'Track GPS location in real-time with 2-5 second updates',
    },
    {
      icon: FiShield,
      title: 'Secure & Private',
      description: 'End-to-end encryption with JWT authentication',
    },
    {
      icon: FiZap,
      title: 'Lightning Fast',
      description: 'Powered by Socket.IO for instant synchronization',
    },
    {
      icon: FiUsers,
      title: 'Multi-User Support',
      description: 'Track multiple users simultaneously on one map',
    },
    {
      icon: FiBell,
      title: 'Smart Notifications',
      description: 'Get alerts for geofence entry/exit and more',
    },
    {
      icon: FiTrendingUp,
      title: 'Analytics Dashboard',
      description: 'View travel history, distance, and detailed stats',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700">
      {/* Header */}
      <nav className="glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-3xl">📍</span>
              <span className="text-xl font-bold text-white">LiveTrack</span>
            </div>
            <div className="flex gap-4">
              <Link
                to="/login"
                className="px-6 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-6 py-2 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Track Location in
            <span className="block text-yellow-300">Real-Time</span>
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Professional GPS tracking system with live updates, geofencing,
            and comprehensive analytics. Perfect for teams, families, and businesses.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-xl"
            >
              Start Free Trial
            </Link>
            <a
              href="#features"
              className="px-8 py-4 bg-white/10 text-white rounded-lg font-semibold text-lg hover:bg-white/20 transition-colors backdrop-blur"
            >
              Learn More
            </a>
          </div>
        </motion.div>

        {/* Demo Map Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-16 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20"
        >
          <div className="relative bg-gradient-to-br from-blue-400 to-blue-600 h-96 flex items-center justify-center">
            <div className="absolute inset-0 bg-grid-white/10" />
            <div className="relative z-10 text-center">
              <div className="text-8xl mb-4 animate-bounce-slow">📍</div>
              <p className="text-white text-2xl font-semibold">Interactive Live Map</p>
              <p className="text-white/80 mt-2">Sign up to see it in action</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-white dark:bg-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Everything you need for professional location tracking
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="glass p-6 rounded-xl hover:shadow-xl transition-shadow"
                >
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="text-primary-600" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-primary-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Active Users', value: '10K+' },
              { label: 'Locations Tracked', value: '1M+' },
              { label: 'Countries', value: '50+' },
              { label: 'Uptime', value: '99.9%' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-white/80">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white dark:bg-gray-900 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Start Tracking?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Join thousands of users who trust LiveTrack for their location tracking needs
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-primary-600 text-white rounded-lg font-semibold text-lg hover:bg-primary-700 transition-colors shadow-xl"
          >
            Create Free Account
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2024 LiveTrack. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Built with React, Node.js, Socket.IO & PostgreSQL
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;