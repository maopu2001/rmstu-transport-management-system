"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bus,
  MapPin,
  Users,
  Shield,
  Mail,
  Globe,
  CheckCircle,
  Code,
  Zap,
  BookOpen,
  Settings,
  Copy,
  ExternalLink,
  ArrowUp,
  Star,
  Download,
  Play,
  RefreshCw,
  AlertCircle,
  Github,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

// Feature data for better maintainability
const features = [
  {
    id: "tracking",
    icon: MapPin,
    title: "Real-Time Vehicle Tracking",
    color: "text-blue-500",
    items: [
      "Live GPS location tracking",
      "Real-time status updates",
      "Interactive map interface",
      "WebSocket-style updates",
    ],
  },
  {
    id: "admin",
    icon: Settings,
    title: "Admin Dashboard",
    color: "text-purple-500",
    items: [
      "Real-time dashboard",
      "Vehicle management",
      "Route & schedule management",
      "Analytics & reporting",
    ],
  },
  {
    id: "driver",
    icon: Bus,
    title: "Driver Interface",
    color: "text-orange-500",
    items: [
      "My Schedule view",
      "Trip control panel",
      "GPS tracking control",
      "Real-time updates",
    ],
  },
  {
    id: "student",
    icon: Users,
    title: "Student Features",
    color: "text-green-500",
    items: [
      "Live bus tracking",
      "Schedule viewing",
      "Bus requisition system",
      "Real-time ETAs",
    ],
  },
  {
    id: "security",
    icon: Shield,
    title: "Authentication & Security",
    color: "text-red-500",
    items: [
      "Role-based access control",
      "JWT authentication",
      "Password reset system",
      "Secure API endpoints",
    ],
  },
  {
    id: "email",
    icon: Mail,
    title: "Email System",
    color: "text-blue-600",
    items: [
      "Password reset emails",
      "Welcome emails",
      "Multiple email providers",
      "Graceful fallbacks",
    ],
  },
];

// Technology stack data
const techStack = {
  Frontend: [
    "Next.js 15",
    "React 18",
    "TypeScript",
    "Tailwind CSS",
    "Shadcn/ui",
  ],
  Backend: ["Next.js API Routes", "Node.js", "MongoDB", "Mongoose"],
  Authentication: ["NextAuth.js", "JWT", "bcrypt"],
  "Maps & Email": ["React Leaflet", "OpenStreetMap", "Nodemailer"],
};

// API endpoints data
const apiEndpoints = {
  Authentication: [
    {
      method: "POST",
      endpoint: "/api/auth/signup",
      description: "User registration",
    },
    { method: "POST", endpoint: "/api/auth/signin", description: "User login" },
    {
      method: "POST",
      endpoint: "/api/auth/forgot-password",
      description: "Password reset request",
    },
    {
      method: "POST",
      endpoint: "/api/auth/reset-password",
      description: "Password reset confirmation",
    },
  ],
  "Admin APIs": [
    {
      method: "GET",
      endpoint: "/api/vehicles",
      description: "List all vehicles",
    },
    {
      method: "POST",
      endpoint: "/api/vehicles",
      description: "Create new vehicle",
    },
    { method: "GET", endpoint: "/api/routes", description: "List all routes" },
    {
      method: "GET",
      endpoint: "/api/schedules",
      description: "List all schedules",
    },
    {
      method: "GET",
      endpoint: "/api/analytics/dashboard",
      description: "Dashboard statistics",
    },
  ],
  "Driver & Student APIs": [
    {
      method: "GET",
      endpoint: "/api/trips/driver",
      description: "Get driver's schedule",
    },
    {
      method: "POST",
      endpoint: "/api/trips/[id]/start",
      description: "Start a trip",
    },
    {
      method: "GET",
      endpoint: "/api/vehicles/active",
      description: "Get active vehicles",
    },
    {
      method: "POST",
      endpoint: "/api/requisitions",
      description: "Submit bus requisition",
    },
  ],
};

// Code snippets for quick start
const codeSnippets = {
  installation: `# Clone the repository
git clone https://github.com/maopu2001/rmstu-transport-management-system.git
cd rmstu-transport-management-system

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env.local`,

  environment: `MONGODB_URI=mongodb://localhost:27017/bus-system
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password`,

  development: `# Development mode
pnpm dev

# Production build
pnpm build && pnpm start

# Run tests (if available)
pnpm test`,
};

export default function DetailsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [copiedText, setCopiedText] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle scroll events for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Copy to clipboard functionality
  const copyToClipboard = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
      setTimeout(() => setCopiedText(""), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy the text manually",
        variant: "destructive",
      });
    }
  }, []);

  // Scroll to top functionality
  const scrollToTop = useCallback(() => {
    setIsAnimating(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setIsAnimating(false), 1000);
  }, []);

  // Get method color for API badges
  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "POST":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "PUT":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "DELETE":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section with enhanced styling */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            RMSTU Transport Management System
          </h1>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            A comprehensive, production-ready bus management system built with
            modern web technologies, featuring real-time tracking, role-based
            access, and seamless user experience.
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Button size="lg" className="gap-2">
              <Github className="h-4 w-4" />
              View on GitHub
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <Star className="h-4 w-4" />
              Star Project
            </Button>
          </div>
        </div>

        {/* Enhanced Tabs Navigation */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          <div className="flex justify-center">
            <TabsList className="grid grid-cols-4 w-fit gap-1">
              <TabsTrigger value="overview" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="technical" className="gap-2">
                <Code className="h-4 w-4" />
                Technical
              </TabsTrigger>
              <TabsTrigger value="quickstart" className="gap-2">
                <Zap className="h-4 w-4" />
                Quick Start
              </TabsTrigger>
              <TabsTrigger value="api" className="gap-2">
                <Globe className="h-4 w-4" />
                API Docs
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Enhanced Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={feature.id}
                    className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2">
                        <Icon
                          className={`h-5 w-5 ${feature.color} group-hover:scale-110 transition-transform`}
                        />
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {feature.items.map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* System Status & Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  System Status & Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      99.9%
                    </div>
                    <div className="text-sm text-muted-foreground">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      &lt; 200ms
                    </div>
                    <div className="text-sm text-muted-foreground">
                      API Response
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      Real-time
                    </div>
                    <div className="text-sm text-muted-foreground">
                      GPS Updates
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      100%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Mobile Ready
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Technical Tab */}
          <TabsContent value="technical" className="space-y-8">
            {/* Enhanced Technology Stack */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Technology Stack
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {Object.entries(techStack).map(([category, technologies]) => (
                    <div key={category}>
                      <h4 className="font-semibold mb-3">{category}</h4>
                      <div className="space-y-2">
                        {technologies.map((tech, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="mr-1 mb-1 hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Architecture Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Architecture & Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <MapPin className="h-4 w-4" />
                        Real-Time Features
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <h5 className="font-medium mb-1">GPS Tracking</h5>
                        <p className="text-sm text-muted-foreground">
                          Browser Geolocation API with 30-second updates,
                          fallback mechanisms, and offline support for seamless
                          tracking experience.
                        </p>
                      </div>
                      <Separator />
                      <div>
                        <h5 className="font-medium mb-1">Live Updates</h5>
                        <p className="text-sm text-muted-foreground">
                          Custom WebSocket-style implementation for real-time
                          data synchronization across all connected clients.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Shield className="h-4 w-4" />
                        Security & Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <h5 className="font-medium mb-1">Security Measures</h5>
                        <p className="text-sm text-muted-foreground">
                          Input validation, XSS protection, CSRF prevention,
                          secure password hashing with bcrypt, and comprehensive
                          role-based access control.
                        </p>
                      </div>
                      <Separator />
                      <div>
                        <h5 className="font-medium mb-1">Performance</h5>
                        <p className="text-sm text-muted-foreground">
                          Optimized MongoDB queries, efficient caching, image
                          optimization, and code splitting for fast loading
                          times.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quick Start Tab */}
          <TabsContent value="quickstart" className="space-y-8">
            {/* Prerequisites & Installation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Prerequisites
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Required</h4>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Node.js 18+ (LTS recommended)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        MongoDB (local or cloud)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        pnpm or npm package manager
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Optional</h4>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                        Email service (Gmail, Outlook, etc.)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                        Docker (for containerization)
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Quick Installation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative">
                      <ScrollArea className="h-32">
                        <pre className="bg-muted p-4 rounded-lg text-sm font-mono overflow-x-auto">
                          {codeSnippets.installation}
                        </pre>
                      </ScrollArea>
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute top-2 right-2"
                        onClick={() =>
                          copyToClipboard(
                            codeSnippets.installation,
                            "Installation commands"
                          )
                        }
                      >
                        {copiedText === "Installation commands" ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <Button className="w-full gap-2">
                      <Play className="h-4 w-4" />
                      Run Installation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Environment Setup */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Environment Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">
                      Environment Variables
                    </h4>
                    <div className="relative">
                      <ScrollArea className="h-40">
                        <pre className="bg-muted p-4 rounded-lg text-sm font-mono">
                          {codeSnippets.environment}
                        </pre>
                      </ScrollArea>
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute top-2 right-2"
                        onClick={() =>
                          copyToClipboard(
                            codeSnippets.environment,
                            "Environment variables"
                          )
                        }
                      >
                        {copiedText === "Environment variables" ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Development Commands</h4>
                    <div className="relative">
                      <ScrollArea className="h-40">
                        <pre className="bg-muted p-4 rounded-lg text-sm font-mono">
                          {codeSnippets.development}
                        </pre>
                      </ScrollArea>
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute top-2 right-2"
                        onClick={() =>
                          copyToClipboard(
                            codeSnippets.development,
                            "Development commands"
                          )
                        }
                      >
                        {copiedText === "Development commands" ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Deployment Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Deployment Platforms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {["Vercel", "Railway", "DigitalOcean", "AWS Amplify"].map(
                    (platform) => (
                      <Button
                        key={platform}
                        variant="outline"
                        className="h-20 flex-col gap-2"
                      >
                        <div className="font-medium">{platform}</div>
                        <div className="text-xs text-muted-foreground">
                          One-click deploy
                        </div>
                      </Button>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Documentation Tab */}
          <TabsContent value="api" className="space-y-8">
            {/* API Endpoints */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  API Endpoints Reference
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {Object.entries(apiEndpoints).map(([category, endpoints]) => (
                    <div key={category}>
                      <h4 className="font-semibold mb-4 text-lg">{category}</h4>
                      <div className="space-y-3">
                        {endpoints.map((endpoint, index) => (
                          <Card key={index} className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Badge
                                  className={getMethodColor(endpoint.method)}
                                >
                                  {endpoint.method}
                                </Badge>
                                <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                  {endpoint.endpoint}
                                </code>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  copyToClipboard(
                                    endpoint.endpoint,
                                    "API endpoint"
                                  )
                                }
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              {endpoint.description}
                            </p>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* API Usage Examples */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Usage Examples
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Authentication Example</h4>
                    <div className="relative">
                      <ScrollArea className="h-32">
                        <pre className="bg-muted p-4 rounded-lg text-sm font-mono">
                          {`// Login example
const response = await fetch('/api/auth/signin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});`}
                        </pre>
                      </ScrollArea>
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute top-2 right-2"
                        onClick={() =>
                          copyToClipboard(
                            "const response = await fetch('/api/auth/signin', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({ email, password })\n});",
                            "Auth example"
                          )
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">
                      Vehicle Tracking Example
                    </h4>
                    <div className="relative">
                      <ScrollArea className="h-32">
                        <pre className="bg-muted p-4 rounded-lg text-sm font-mono">
                          {`// Get active vehicles
const vehicles = await fetch('/api/vehicles/active');
const data = await vehicles.json();
console.log(data.vehicles);`}
                        </pre>
                      </ScrollArea>
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute top-2 right-2"
                        onClick={() =>
                          copyToClipboard(
                            "const vehicles = await fetch('/api/vehicles/active');\nconst data = await vehicles.json();\nconsole.log(data.vehicles);",
                            "Vehicle example"
                          )
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Enhanced Footer with additional resources */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Resources & Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  Development
                </h4>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    GitHub Repository
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Documentation
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Report Issues
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Community</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Join our community for support, contributions, and updates.
                </p>
                <div className="space-y-2">
                  <Badge variant="outline">MIT License</Badge>
                  <Badge variant="outline">Open Source</Badge>
                  <Badge variant="outline">Active Development</Badge>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Latest Updates</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Real-time GPS tracking ✨</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Enhanced security features 🔒</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Mobile responsive design 📱</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Production ready 🚀</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Top Button */}
        {showBackToTop && (
          <Button
            className={`fixed bottom-6 right-6 rounded-full p-3 shadow-lg transition-all duration-300 ${
              isAnimating ? "animate-pulse" : ""
            }`}
            onClick={scrollToTop}
            size="sm"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
