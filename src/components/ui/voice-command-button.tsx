
import React, { useState, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import speechRecognition from "@/utils/speechRecognition";
import { toast } from "sonner";

interface VoiceCommandButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  onTranscript?: (transcript: string) => void;
  commands?: Array<{
    command: string;
    action: () => void;
    phrases?: string[];
  }>;
  showTranscript?: boolean;
  label?: string;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "inline";
  continuousListening?: boolean;
}

export function VoiceCommandButton({
  size = "icon",
  variant = "outline",
  onTranscript,
  commands = [],
  className,
  showTranscript = false,
  label,
  position = "inline",
  continuousListening = false,
  ...props
}: VoiceCommandButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    // Check if speech recognition is supported
    setSupported(speechRecognition.isSupported());
    
    // Register commands
    if (commands.length > 0) {
      speechRecognition.clearCommands().registerCommands(commands);
    }

    // Set callbacks
    speechRecognition
      .setOnResult((newTranscript) => {
        setTranscript(newTranscript);
        if (onTranscript) onTranscript(newTranscript);
      })
      .setOnListeningChange((listening) => {
        setIsListening(listening);
        // If continuous listening is enabled and recognition stopped, restart it
        if (continuousListening && !listening && isListening) {
          setTimeout(() => {
            speechRecognition.startListening();
          }, 300);
        }
      });

    return () => {
      // Clean up by stopping listening if component unmounts while active
      if (isListening) {
        speechRecognition.stopListening();
      }
    };
  }, [commands, onTranscript, continuousListening, isListening]);

  const toggleListening = () => {
    if (!supported) {
      toast.error("Speech recognition is not supported in your browser");
      return;
    }

    if (isListening) {
      speechRecognition.stopListening();
      setTranscript("");
      // Ensure we don't auto-restart
      setIsListening(false);
    } else {
      speechRecognition.startListening();
      toast.info("Listening for voice commands...");
    }
  };

  if (!supported) {
    return null; // Don't show the button if not supported
  }

  const positionClasses = {
    "top-right": "fixed top-4 right-4 z-50",
    "top-left": "fixed top-4 left-4 z-50",
    "bottom-right": "fixed bottom-4 right-4 z-50",
    "bottom-left": "fixed bottom-4 left-4 z-50",
    "inline": "",
  };

  return (
    <div className={position !== "inline" ? positionClasses[position] : ""}>
      <div className="flex flex-col items-center">
        <Button
          onClick={toggleListening}
          size={size}
          variant={isListening ? "default" : variant}
          className={`${className} ${isListening ? "bg-red-500 hover:bg-red-600" : ""}`}
          {...props}
          aria-label={isListening ? "Stop listening" : "Start voice command"}
          title={isListening ? "Stop listening" : "Start voice command"}
        >
          {isListening ? 
            <Mic className="h-5 w-5 text-white animate-pulse" /> : 
            <MicOff className="h-5 w-5" />
          }
          {label && <span className="ml-2">{label}</span>}
        </Button>
        
        {showTranscript && transcript && (
          <div className="mt-2 text-sm bg-background border rounded-md p-2 shadow-sm max-w-xs">
            <p className="font-medium">I heard:</p>
            <p className="italic">"{transcript}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
