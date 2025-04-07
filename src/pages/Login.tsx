
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { VoiceCommandButton } from "@/components/ui/voice-command-button";
import { Mic } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  // Detect demo accounts in transcript
  useEffect(() => {
    if (!transcript) return;
    
    if (transcript.includes("admin")) {
      setUsername("admin");
      toast.info("Username set to 'admin'");
    } else if (transcript.includes("cashier")) {
      setUsername("cashier");
      toast.info("Username set to 'cashier'");
    }
    
    // If transcript includes login/sign in and we have a username, attempt login
    if ((transcript.includes("login") || transcript.includes("sign in")) && username) {
      handleLogin(new Event("voice") as any);
    }
  }, [transcript]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error("Please enter both username and password");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await login(username, password);
      
      if (success) {
        toast.success("Login successful");
        navigate("/");
      } else {
        toast.error("Invalid username or password");
      }
    } catch (error) {
      toast.error("Login failed. Please try again later.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const voiceCommands = [
    {
      command: "login",
      phrases: ["sign in", "log me in", "access system"],
      action: () => {
        if (username && password) {
          handleLogin(new Event("voice") as any);
        } else {
          toast.info("Please provide username and password");
        }
      }
    },
    {
      command: "admin",
      phrases: ["use admin", "admin account"],
      action: () => {
        setUsername("admin");
        toast.info("Username set to 'admin'");
      }
    },
    {
      command: "cashier",
      phrases: ["use cashier", "cashier account"],
      action: () => {
        setUsername("cashier");
        toast.info("Username set to 'cashier'");
      }
    },
    {
      command: "password",
      phrases: ["set password", "use password"],
      action: () => {
        setPassword("demo123");
        toast.info("Password set for demo");
      }
    }
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">POS System Login</CardTitle>
            <VoiceCommandButton 
              commands={voiceCommands}
              onTranscript={setTranscript}
              className="ml-2"
            />
          </div>
          {transcript && (
            <div className="text-sm text-muted-foreground mt-2 p-2 bg-secondary rounded-md">
              <p>I heard: "{transcript}"</p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6 px-1 py-2">
            <div className="space-y-3">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                autoComplete="username"
                required
                className="py-6"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="py-6"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full py-6 flex items-center justify-center gap-2" 
              disabled={isLoading}
              data-testid="login-button"
            >
              {isLoading ? "Logging in..." : "Login"}
              {!isLoading && <Mic className="h-4 w-4 opacity-70" />}
            </Button>
            
            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Voice commands:</p>
              <p>"admin" / "cashier" - Set username</p>
              <p>"password" - Set demo password</p>
              <p>"login" - Submit form</p>
            </div>
            
            <div className="mt-2 text-center text-sm text-muted-foreground">
              <p>Demo accounts:</p>
              <p>Username: admin</p>
              <p>Username: cashier</p>
              <p>(Any password will work)</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
