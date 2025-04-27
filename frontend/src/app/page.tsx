import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Maximize2, Minimize2, Loader2, Settings, X } from "lucide-react";
import { Whiteboard } from "../components/Whiteboard";
import aiService, { ChatMessage } from "@/services/AIService";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16 md:py-24 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-background">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            <span className="text-blue-600 dark:text-blue-400">Mind</span>Sync: Collaborative Learning
          </h1>
          <p className="mt-6 text-xl md:text-2xl text-gray-600 dark:text-gray-300">
            Transform your learning experience with real-time collaboration, AI assistance, and interactive study tools.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 px-4 bg-white dark:bg-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              title="Study Groups" 
              description="Find or create study groups based on subjects. Collaborate with peers to enhance your learning experience."
              icon={<GroupIcon />}
            />
            <FeatureCard 
              title="Interactive Whiteboard" 
              description="Real-time collaborative whiteboard with drawing, text, and image tools to visualize concepts together."
              icon={<BoardIcon />}
            />
            <FeatureCard 
              title="AI-Powered Assistance" 
              description="Get instant help from our AI tutor. Upload documents for summaries and explanations."
              icon={<AiIcon />}
            />
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12">
            Our platform makes collaborative learning simple and effective
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <StepCard 
              number="1" 
              title="Create Account" 
              description="Sign up for a free account to access all features"
            />
            <StepCard 
              number="2" 
              title="Find Study Groups" 
              description="Browse or create study groups based on your interests"
            />
            <StepCard 
              number="3" 
              title="Collaborate" 
              description="Use interactive tools to learn together in real-time"
            />
            <StepCard 
              number="4" 
              title="Get AI Help" 
              description="Ask questions or upload documents for AI assistance"
            />
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 px-4 bg-blue-600 dark:bg-blue-800 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to transform your learning experience?</h2>
          <p className="mb-8 text-blue-100">Join thousands of students enhancing their education with MindSync.</p>
          <Button asChild size="lg" variant="secondary" className="text-blue-800">
            <Link href="/signup">Start Learning Now</Link>
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} MindSync. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold mb-4">
        {number}
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

function GroupIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  );
}

function BoardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="3" y1="9" x2="21" y2="9"></line>
      <line x1="9" y1="21" x2="9" y2="9"></line>
    </svg>
  );
}

function AiIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
      <path d="M12 2v10h10a10 10 0 0 0-10-10z" />
      <circle cx="12" cy="12" r="6" />
    </svg>
  );
}
