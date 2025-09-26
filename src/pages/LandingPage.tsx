"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MadeWithDyad } from '@/components/made-with-dyad';
import FeatureCard from '@/components/FeatureCard';
import { UploadCloud, Scissors, Combine, FolderArchive } from 'lucide-react';
import AppHeader from '@/components/AppHeader'; // Import AppHeader

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
      <AppHeader /> {/* AppHeader added here */}

      {/* Hero Section */}
      <section className="relative py-24 md:py-40 text-center px-4 overflow-hidden pt-32"> {/* Adjusted padding for header */}
        <div className="container mx-auto max-w-5xl relative z-10">
          <h1 className="text-6xl md:text-7xl font-extrabold leading-tight mb-8 text-blue-800 dark:text-blue-300 tracking-tight">
            SplitMyPDF.online: <br className="hidden md:inline"/> Effortless PDF Management
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            Upload, Split, Merge, and Organize Your Documents with unparalleled ease. Secure, lightning-fast, and intuitively designed for you.
          </p>
          <Button asChild className="px-10 py-7 text-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl">
            <Link to="/login">Get Started Free</Link>
          </Button>
        </div>
        {/* Subtle background animation/elements for modern feel */}
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob absolute top-0 left-0"></div>
          <div className="w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 absolute bottom-0 right-0"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-white dark:bg-gray-900 px-4">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-5xl font-bold text-center mb-20 text-gray-800 dark:text-white tracking-tight">
            Powerful PDF Tools at Your Fingertips
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 h-full">
            <FeatureCard
              title="Upload & Manage"
              description="Securely upload and store your PDF documents in the cloud. Access them anytime, anywhere, with robust security."
              icon={UploadCloud}
              bgColorClass="bg-gradient-to-br from-blue-600 to-blue-400"
              glowColorClass="from-blue-300/70"
            />
            <FeatureCard
              title="Split PDFs"
              description="Effortlessly break down large PDF files into individual pages or smaller, manageable documents. Perfect for extracting specific sections."
              icon={Scissors}
              bgColorClass="bg-gradient-to-br from-green-600 to-green-400"
              glowColorClass="from-green-300/70"
            />
            <FeatureCard
              title="Merge PDFs"
              description="Combine multiple PDF files into a single, cohesive document. Streamline your reports, presentations, and consolidate information."
              icon={Combine}
              bgColorClass="bg-gradient-to-br from-purple-600 to-purple-400"
              glowColorClass="from-purple-300/70"
            />
            <FeatureCard
              title="Organize & Download"
              description="Keep your documents perfectly organized and download split or merged files with a single click, including convenient ZIP archives."
              icon={FolderArchive}
              bgColorClass="bg-gradient-to-br from-orange-600 to-orange-400"
              glowColorClass="from-orange-300/70"
            />
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24 md:py-36 text-center bg-blue-700 dark:bg-blue-900 text-white px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-5xl md:text-6xl font-bold mb-10 leading-tight">
            Ready to Simplify Your PDF Workflow?
          </h2>
          <p className="text-xl md:text-2xl mb-14 opacity-90 max-w-3xl mx-auto">
            Join thousands of satisfied users who trust SplitMyPDF.online for their essential document needs.
          </p>
          <Button asChild className="px-12 py-8 text-2xl bg-white hover:bg-gray-100 text-blue-700 dark:text-blue-900 rounded-full shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-2xl">
            <Link to="/login">Start Your Free Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-gray-800 dark:bg-gray-950 text-gray-400 text-center px-4">
        <div className="container mx-auto">
          <p className="mb-3 text-lg">&copy; {new Date().getFullYear()} SplitMyPDF.online. All rights reserved.</p>
          <MadeWithDyad />
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;