"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { User, Plane, Building } from "lucide-react";

export function RoleSelector() {
  const { login } = useAuth();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"traveler" | "agency">("traveler");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;

    setIsLoading(true);

    try {
      const user = login(email, selectedRole, name || undefined);
      
      // Redirect based on role
      if (selectedRole === "agency") {
        router.push("/agency/dashboard");
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome to Trip Planner</h1>
            <p className="text-muted-foreground">Choose your role to get started</p>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <Label className="text-base font-medium mb-3 block">I am a:</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={selectedRole === "traveler" ? "default" : "outline"}
                onClick={() => setSelectedRole("traveler")}
                className="h-16 flex flex-col gap-2"
              >
                <Plane className="h-6 w-6" />
                <span>Traveler</span>
              </Button>
              <Button
                type="button"
                variant={selectedRole === "agency" ? "default" : "outline"}
                onClick={() => setSelectedRole("agency")}
                className="h-16 flex flex-col gap-2"
              >
                <Building className="h-6 w-6" />
                <span>Agency</span>
              </Button>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name (optional)</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !email}
            >
              {isLoading ? "Signing in..." : `Continue as ${selectedRole}`}
            </Button>
          </form>

          {/* Role Description */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg text-sm">
            <h3 className="font-medium mb-2">
              {selectedRole === "traveler" ? "Traveler" : "Agency"} Information
            </h3>
            {selectedRole === "traveler" ? (
              <div className="space-y-1 text-muted-foreground">
                <p>• Discover personalized travel destinations</p>
                <p>• Swipe through travel preferences</p>
                <p>• Get AI-generated itineraries</p>
                <p>• Connect with travel agencies</p>
              </div>
            ) : (
              <div className="space-y-1 text-muted-foreground">
                <p>• Create and manage travel packages</p>
                <p>• View market trends and analytics</p>
                <p>• Connect with interested travelers</p>
                <p>• Grow your travel business</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
