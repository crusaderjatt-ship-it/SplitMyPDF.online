"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud, Scissors, Combine, FolderArchive } from 'lucide-react';
import { MadeWithDyad } from '@/components/made-with-dyad';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 text-center px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 text-blue-800 dark:text-blue-300">
            Effortless PDF Management for Everyone
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-gray-700 dark:text-gray-300">
            Upload, Split, Merge, and Organize Your Documents with Ease. Secure, Fast, and User-Friendly.
          </p>
          <Button asChild className="px-8 py-6 text-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1">
            <Link to="/login">Get Started Free</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-900 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800 dark:text-white">
            Powerful PDF Tools at Your Fingertips
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="flex flex-col items-center text-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 dark:bg-gray-800 dark:border-gray-700">
              <UploadCloud className="h-12 w-12 text-blue-500 mb-4" />
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-white">Upload & Manage</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600 dark:text-gray-400">
                Securely upload and store your PDF documents in the cloud. Access them anytime, anywhere.
              </CardContent>
            </Card>

            <Card className="flex flex-col items-center text-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 dark:bg-gray-800 dark:border-gray-700">
              <Scissors className="h-12 w-12 text-green-500 mb-4" />
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-white">Split PDFs</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600 dark:text-gray-400">
                Break down large PDF files into individual pages or smaller documents. Perfect for extracting specific sections.
              </CardContent>
            </Card>

            <Card className="flex flex-col items-center text-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 dark:bg-gray-800 dark:border-gray-700">
              <Combine className="h-12 w-12 text-purple-500 mb-4" />
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-white">Merge PDFs</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600 dark:text-gray-400">
                Combine multiple PDF files into a single, cohesive document. Streamline your reports, presentations, and more.
              </CardContent>
            </Card>

            <Card className="flex flex-col items-center text-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 dark:bg-gray-800 dark:border-gray-700">
              <FolderArchive className="h-12 w-12 text-orange-500 mb-4" />
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-white">Organize & Download</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600 dark:text-gray-400">
                Keep your documents organized and download split or merged files with a single click, even as a ZIP.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 md:py-28 text-center bg-blue-600 dark:bg-blue-800 text-white px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Ready to Simplify Your PDF Workflow?
          </h2>
          <p className="text-xl md:text-2xl mb-10 opacity-90">
            Join thousands of users who trust our platform for their document needs.
          </p>
          <Button asChild className="px-10 py-7 text-xl bg-white hover:bg-gray-100 text-blue-600 dark:text-blue-800 rounded-full shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1">
            <Link to="/login">Sign Up Now</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-800 dark:bg-gray-950 text-gray-400 text-center px-4">
        <div className="container mx-auto">
          <p className="mb-2">&copy; {new Date().getFullYear()} PDF SaaS. All rights reserved.</p>
          <MadeWithDyad />
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;