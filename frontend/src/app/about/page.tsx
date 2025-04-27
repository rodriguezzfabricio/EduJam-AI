import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto py-12 px-4">
        <section className="mb-16 max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">About MindSync Whiteboard</h1>
          
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-xl mb-8 text-center text-muted-foreground">
              A collaborative whiteboard platform with real-time syncing and AI assistance
            </p>
            
            <div className="flex justify-center mb-12">
              <div className="w-24 h-24 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                <svg width="48" height="48" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                  <path d="M16 4C9.37 4 4 9.37 4 16C4 22.63 9.37 28 16 28C22.63 28 28 22.63 28 16C28 9.37 22.63 4 16 4ZM16 7C19.86 7 23 10.14 23 14C23 17.86 19.86 21 16 21C12.14 21 9 17.86 9 14C9 10.14 12.14 7 16 7Z" fill="currentColor"/>
                </svg>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold mt-12 mb-4">Our Mission</h2>
            <p className="mb-6">
              MindSync was developed to make visual collaboration seamless across distances. Our mission is to 
              provide a whiteboard platform that combines intuitive drawing tools with real-time synchronization 
              and AI assistance, making it easy for teams, educators, and students to collaborate visually.
            </p>
            
            <h2 className="text-2xl font-bold mt-12 mb-4">How It Works</h2>
            <p className="mb-6">
              MindSync Whiteboard uses advanced web technologies to provide a responsive drawing experience that 
              syncs in real-time across all users. When you draw on the canvas, your actions are immediately 
              broadcast to all other users viewing the same whiteboard.
            </p>
            
            <p className="mb-6">
              Our AI assistant is integrated directly into the interface through a chat sidebar, providing 
              help, answering questions, and offering suggestions as you work.
            </p>
            
            <div className="bg-muted p-6 rounded-lg mt-12 mb-8">
              <h3 className="text-xl font-semibold mb-4">Key Features</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Real-Time Collaboration:</strong> See changes from all users instantly as they happen.
                </li>
                <li>
                  <strong>Customizable Drawing Tools:</strong> Choose from multiple colors and brush sizes.
                </li>
                <li>
                  <strong>AI Chat Assistant:</strong> Get help and answers while you work.
                </li>
                <li>
                  <strong>Responsive Design:</strong> Works on desktop and mobile devices.
                </li>
                <li>
                  <strong>Dark Mode Support:</strong> Switch between light and dark themes for comfortable viewing.
                </li>
              </ul>
            </div>
            
            <h2 className="text-2xl font-bold mt-12 mb-4">Technology Stack</h2>
            <p className="mb-4">
              MindSync is built using modern web technologies:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>
                <strong>Frontend:</strong> Next.js, React, TypeScript, Tailwind CSS
              </li>
              <li>
                <strong>Real-time Sync:</strong> Local storage events for demo (WebSockets in production)
              </li>
              <li>
                <strong>Canvas API:</strong> HTML5 Canvas for drawing functionality
              </li>
              <li>
                <strong>UI Components:</strong> Shadcn UI and Radix UI for accessible interface elements
              </li>
              <li>
                <strong>AI Integration:</strong> Currently simulated AI responses (OpenAI API in production)
              </li>
            </ul>
            
            <div className="mt-12 p-6 border border-border rounded-lg text-center">
              <h3 className="text-xl font-semibold mb-2">Try it today</h3>
              <p className="mb-4">Experience the power of real-time visual collaboration with MindSync Whiteboard.</p>
              <p className="text-muted-foreground">Open the same whiteboard in multiple browsers to see the real-time sync in action!</p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
} 