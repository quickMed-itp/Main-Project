import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const ContactPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Contact Us</h1>
      
      <div className="max-w-3xl mx-auto grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
          <Mail className="w-8 h-8 text-blue-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Email</h2>
          <p className="text-gray-600">support@pharmacy.com</p>
          <a href="mailto:support@pharmacy.com" className="text-blue-600 hover:text-blue-800 mt-2">
            Send us an email
          </a>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
          <Phone className="w-8 h-8 text-blue-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Phone</h2>
          <p className="text-gray-600">+1 (555) 123-4567</p>
          <p className="text-sm text-gray-500 mt-2">Mon-Fri: 9AM-6PM</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
          <MapPin className="w-8 h-8 text-blue-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Address</h2>
          <p className="text-gray-600">
            123 Pharmacy Street<br />
            Medical District<br />
            Health City, HC 12345
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto mt-12">
        <form className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6">Send us a message</h2>
          
          <div className="grid gap-6 mb-6 md:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="block mb-2 text-sm font-medium text-gray-900">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="John"
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block mb-2 text-sm font-medium text-gray-900">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Doe"
                required
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              placeholder="john.doe@example.com"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-900">
              Message
            </label>
            <textarea
              id="message"
              rows={4}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              placeholder="Your message..."
              required
            />
          </div>
          
          <button
            type="submit"
            className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center w-full md:w-auto"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;