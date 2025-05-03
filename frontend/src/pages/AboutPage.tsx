import React from 'react';
import { Clock, Medal, Users, Stethoscope } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Your Trusted Healthcare Partner
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          We're committed to providing accessible, reliable, and professional pharmacy services
          to our community with a focus on patient care and well-being.
        </p>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="flex justify-center mb-4">
            <Clock className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">24/7 Service</h3>
          <p className="text-gray-600">
            Available round the clock for all your medical needs
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="flex justify-center mb-4">
            <Medal className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Licensed Professionals</h3>
          <p className="text-gray-600">
            Expert pharmacists and healthcare professionals
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="flex justify-center mb-4">
            <Users className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Patient-Centered</h3>
          <p className="text-gray-600">
            Personalized care and attention for every patient
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="flex justify-center mb-4">
            <Stethoscope className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Quality Healthcare</h3>
          <p className="text-gray-600">
            Premium medical supplies and medications
          </p>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-8 mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Our Mission</h2>
        <div className="max-w-3xl mx-auto">
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            Our mission is to enhance the health and wellbeing of our community by providing
            accessible, high-quality pharmaceutical care and professional health services.
          </p>
          <p className="text-gray-700 text-lg leading-relaxed">
            We strive to be at the forefront of healthcare innovation while maintaining
            the personal touch and care that our patients deserve and expect.
          </p>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-2xl font-semibold mb-4">Have Questions?</h2>
        <p className="text-gray-600 mb-6">
          Our team is here to help you with any inquiries about our services.
        </p>
        <a
          href="/contact"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
        >
          Contact Us
        </a>
      </div>
    </div>
  );
};

export default AboutPage;