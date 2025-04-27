import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function HelpPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto py-12 px-4">
        <section className="mb-16 max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">How to Use MindSync Whiteboard</h1>
          
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-xl mb-8 text-center text-muted-foreground">
              Get started with our interactive whiteboard and AI assistant
            </p>
            
            <h2 className="text-2xl font-bold mt-12 mb-4">Whiteboard Basics</h2>
            <p className="mb-4">
              Our whiteboard provides an intuitive canvas for drawing, sketching, and collaborating in real-time.
              Here's how to get started:
            </p>
            
            <div className="bg-muted p-6 rounded-lg mb-8">
              <h3 className="text-xl font-semibold mb-4">Drawing Tools</h3>
              <ul className="list-disc pl-6 space-y-3">
                <li>
                  <strong>Color Palette:</strong> Click on any color in the palette to change your drawing color.
                  Use white for erasing.
                </li>
                <li>
                  <strong>Brush Size:</strong> Adjust the slider to change the thickness of your brush.
                </li>
                <li>
                  <strong>Clear Canvas:</strong> Click the "Clear" button to erase everything and start fresh.
                </li>
              </ul>
            </div>
            
            <h2 className="text-2xl font-bold mt-12 mb-4">Real-Time Collaboration</h2>
            <p className="mb-4">
              MindSync Whiteboard updates in real-time across multiple browsers or tabs. Any changes you make
              are immediately visible to everyone viewing the same whiteboard.
            </p>
            
            <div className="bg-muted p-6 rounded-lg mb-8">
              <h3 className="text-xl font-semibold mb-4">How Collaboration Works</h3>
              <ul className="list-disc pl-6 space-y-3">
                <li>
                  <strong>Automatic Syncing:</strong> Changes are broadcast to all connected users automatically.
                </li>
                <li>
                  <strong>Multiple Users:</strong> Multiple people can draw on the same canvas simultaneously.
                </li>
                <li>
                  <strong>Shared View:</strong> Everyone sees the same canvas state in real-time.
                </li>
              </ul>
            </div>
            
            <h2 className="text-2xl font-bold mt-12 mb-4">AI Chat Assistant</h2>
            <p className="mb-4">
              Our built-in AI assistant can help answer questions about using the whiteboard or any other topic.
            </p>
            
            <div className="bg-muted p-6 rounded-lg mb-8">
              <h3 className="text-xl font-semibold mb-4">Chat Features</h3>
              <ul className="list-disc pl-6 space-y-3">
                <li>
                  <strong>Expand/Collapse:</strong> Use the maximize/minimize button to adjust the chat panel size.
                </li>
                <li>
                  <strong>Ask Anything:</strong> The AI can answer questions about the whiteboard functionality
                  or any other topic you're curious about.
                </li>
                <li>
                  <strong>Command Suggestions:</strong> Try asking "How do I change colors?" or "Can you explain how the real-time sync works?"
                </li>
              </ul>
            </div>
            
            <h2 className="text-2xl font-bold mt-12 mb-4">Keyboard Shortcuts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Clear Canvas</span>
                  <span className="px-2 py-1 bg-background rounded text-sm">Ctrl + X</span>
                </div>
                <p className="text-sm text-muted-foreground">Clear the entire whiteboard</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Toggle Chat</span>
                  <span className="px-2 py-1 bg-background rounded text-sm">Ctrl + /</span>
                </div>
                <p className="text-sm text-muted-foreground">Expand or collapse the chat panel</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Undo</span>
                  <span className="px-2 py-1 bg-background rounded text-sm">Ctrl + Z</span>
                </div>
                <p className="text-sm text-muted-foreground">Undo last drawing action</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Redo</span>
                  <span className="px-2 py-1 bg-background rounded text-sm">Ctrl + Y</span>
                </div>
                <p className="text-sm text-muted-foreground">Redo last undone action</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
} 