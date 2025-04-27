import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto py-12 px-4">
        <section className="mb-16 text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6">Our Features</h1>
          <p className="text-xl text-muted-foreground">
            Discover all the powerful features that make EduJam AI the perfect learning companion.
          </p>
        </section>

        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-sm">
                <CardHeader>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

const features = [
  {
    title: "AI-Powered Learning",
    description: "Personalized education with artificial intelligence",
    content: "Our AI analyzes your learning patterns and adapts content to match your specific needs, ensuring that you're always challenged but never overwhelmed."
  },
  {
    title: "Interactive Exercises",
    description: "Engage with dynamic learning materials",
    content: "Practice what you learn with interactive exercises designed to reinforce knowledge and build confidence. Receive real-time feedback that helps you understand your mistakes."
  },
  {
    title: "Progress Tracking",
    description: "Monitor your educational journey",
    content: "Track your learning progress with detailed analytics that show your strengths, weaknesses, and growth over time. Set goals and watch as you achieve them."
  },
  {
    title: "Study Plans",
    description: "Structured learning paths for success",
    content: "Follow expertly crafted study plans that guide you through complex subjects step by step, ensuring comprehensive understanding and retention."
  },
  {
    title: "Collaborative Learning",
    description: "Learn together with peers",
    content: "Connect with fellow learners, share insights, and collaborate on projects to enhance your understanding through different perspectives."
  },
  {
    title: "Mobile Learning",
    description: "Learn on the go",
    content: "Access your courses, exercises, and progress from any device, allowing you to continue your education whenever and wherever inspiration strikes."
  }
]; 