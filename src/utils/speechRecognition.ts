
// Speech recognition utility
// This uses the Web Speech API which is available in most modern browsers

interface SpeechCommand {
  command: string;
  action: () => void;
  phrases?: string[];
}

class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  private commands: SpeechCommand[] = [];
  private onResultCallback: ((transcript: string) => void) | null = null;
  private onListeningChangeCallback: ((isListening: boolean) => void) | null = null;
  private globalCommands: SpeechCommand[] = [];
  private commandMatchThreshold: number = 0.7; // Fuzzy matching threshold

  constructor() {
    this.initRecognition();
    this.setupGlobalCommands();
  }

  private initRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported in this browser.');
      return;
    }

    // Initialize SpeechRecognition object
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    // Configure recognition
    if (this.recognition) {
      this.recognition.continuous = false;
      this.recognition.interimResults = true; // Get partial results for faster response
      this.recognition.maxAlternatives = 3; // Get multiple interpretations
      this.recognition.lang = 'en-US';

      // Set up event handlers
      this.recognition.onresult = this.handleResult.bind(this);
      this.recognition.onend = this.handleEnd.bind(this);
      this.recognition.onerror = this.handleError.bind(this);
    }
  }

  private setupGlobalCommands() {
    // Setup global commands that work throughout the application
    this.globalCommands = [
      {
        command: "home",
        phrases: ["go home", "dashboard", "main screen", "main menu", "back to home"],
        action: () => {
          // Navigate without page reload
          this.navigateWithoutReload("/");
        }
      },
      {
        command: "logout",
        phrases: ["sign out", "exit system", "log out", "sign me out"],
        action: () => {
          // Navigate without page reload
          this.navigateWithoutReload("/login");
        }
      },
      {
        command: "products",
        phrases: ["show products", "goto products", "product list", "product page", "view products"],
        action: () => {
          this.navigateWithoutReload("/products");
        }
      },
      {
        command: "orders",
        phrases: ["show orders", "goto orders", "order list", "order page", "view orders"],
        action: () => {
          this.navigateWithoutReload("/orders");
        }
      },
      {
        command: "customers",
        phrases: ["show customers", "goto customers", "customer list", "customer page", "view customers"],
        action: () => {
          this.navigateWithoutReload("/customers");
        }
      },
      {
        command: "reports",
        phrases: ["show reports", "goto reports", "report list", "report page", "view reports"],
        action: () => {
          this.navigateWithoutReload("/reports");
        }
      },
      {
        command: "settings",
        phrases: ["show settings", "goto settings", "setting page", "preferences", "view settings"],
        action: () => {
          this.navigateWithoutReload("/settings");
        }
      },
      {
        command: "users",
        phrases: ["show users", "goto users", "user list", "user page", "view users"],
        action: () => {
          this.navigateWithoutReload("/users");
        }
      },
      {
        command: "pos",
        phrases: ["open pos", "start pos", "point of sale", "goto pos", "pos page", "view pos"],
        action: () => {
          this.navigateWithoutReload("/pos-session");
        }
      },
      {
        command: "shop",
        phrases: ["shop mode", "open shop", "goto shop", "shop page", "view shop", "pos shop"],
        action: () => {
          this.navigateWithoutReload("/pos-shop");
        }
      }
    ];
  }

  private navigateWithoutReload(path: string) {
    // Use React Router's navigation without page reload
    if (window.location.pathname !== path) {
      const history = window.history;
      history.pushState({}, "", path);
      // Dispatch a navigation event to notify React Router
      window.dispatchEvent(new Event('popstate'));
    }
  }

  // Calculate similarity between two strings (for fuzzy matching)
  private stringSimilarity(s1: string, s2: string): number {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    if (longer.length === 0) {
      return 1.0;
    }
    
    // Check if the shorter string is contained within the longer one
    if (longer.toLowerCase().includes(shorter.toLowerCase())) {
      return 0.9;
    }
    
    // Check for words match
    const s1Words = s1.toLowerCase().split(' ');
    const s2Words = s2.toLowerCase().split(' ');
    
    let matchCount = 0;
    for (const word of s1Words) {
      if (s2Words.includes(word) && word.length > 1) {
        matchCount++;
      }
    }
    
    if (matchCount > 0) {
      return matchCount / Math.max(s1Words.length, s2Words.length);
    }
    
    return 0;
  }

  public setOnResult(callback: (transcript: string) => void) {
    this.onResultCallback = callback;
    return this;
  }

  public setOnListeningChange(callback: (isListening: boolean) => void) {
    this.onListeningChangeCallback = callback;
    return this;
  }

  private handleResult(event: SpeechRecognitionEvent) {
    // Get the most confident result
    const results = event.results;
    const isFinal = results[0].isFinal;
    const transcript = results[0][0].transcript.trim().toLowerCase();
    
    // Call the result callback with every transcript, not just final ones
    if (this.onResultCallback) {
      this.onResultCallback(transcript);
    }
    
    // Only process commands on final results to avoid multiple triggers
    if (isFinal) {
      console.log('Final speech recognized:', transcript);
      this.processCommands(transcript);
    }
  }

  private handleEnd() {
    this.isListening = false;
    if (this.onListeningChangeCallback) {
      this.onListeningChangeCallback(false);
    }
  }

  private handleError(event: SpeechRecognitionErrorEvent) {
    console.error('Speech recognition error:', event.error);
    this.isListening = false;
    if (this.onListeningChangeCallback) {
      this.onListeningChangeCallback(false);
    }
  }

  public registerCommand(command: SpeechCommand) {
    this.commands.push(command);
    return this;
  }

  public registerCommands(commands: SpeechCommand[]) {
    this.commands.push(...commands);
    return this;
  }

  private processCommands(transcript: string) {
    // Store all potential command matches with their similarity scores
    type CommandMatch = { command: SpeechCommand, score: number };
    const matches: CommandMatch[] = [];
    
    // Check page-specific commands
    for (const cmd of this.commands) {
      // Check exact match first
      if (transcript === cmd.command.toLowerCase()) {
        cmd.action();
        return;
      }
      
      // Check if command is contained within transcript
      if (transcript.includes(cmd.command.toLowerCase())) {
        matches.push({ command: cmd, score: 0.95 });
      } else {
        // Check similarity
        const similarity = this.stringSimilarity(transcript, cmd.command);
        if (similarity >= this.commandMatchThreshold) {
          matches.push({ command: cmd, score: similarity });
        }
      }

      // Check alternate phrases with fuzzy matching
      if (cmd.phrases) {
        for (const phrase of cmd.phrases) {
          if (transcript === phrase.toLowerCase()) {
            cmd.action();
            return;
          }
          
          if (transcript.includes(phrase.toLowerCase())) {
            matches.push({ command: cmd, score: 0.9 });
          } else {
            const similarity = this.stringSimilarity(transcript, phrase);
            if (similarity >= this.commandMatchThreshold) {
              matches.push({ command: cmd, score: similarity });
            }
          }
        }
      }
    }

    // Then check global commands the same way
    for (const cmd of this.globalCommands) {
      // Check exact match first
      if (transcript === cmd.command.toLowerCase()) {
        cmd.action();
        return;
      }
      
      // Check if command is contained within transcript
      if (transcript.includes(cmd.command.toLowerCase())) {
        matches.push({ command: cmd, score: 0.9 });
      } else {
        // Check similarity
        const similarity = this.stringSimilarity(transcript, cmd.command);
        if (similarity >= this.commandMatchThreshold) {
          matches.push({ command: cmd, score: similarity });
        }
      }

      // Check alternate phrases with fuzzy matching
      if (cmd.phrases) {
        for (const phrase of cmd.phrases) {
          if (transcript === phrase.toLowerCase()) {
            cmd.action();
            return;
          }
          
          if (transcript.includes(phrase.toLowerCase())) {
            matches.push({ command: cmd, score: 0.9 });
          } else {
            const similarity = this.stringSimilarity(transcript, phrase);
            if (similarity >= this.commandMatchThreshold) {
              matches.push({ command: cmd, score: similarity });
            }
          }
        }
      }
    }
    
    // Execute the command with the highest match score if we have any matches
    if (matches.length > 0) {
      // Sort by score in descending order
      matches.sort((a, b) => b.score - a.score);
      const bestMatch = matches[0];
      
      if (bestMatch.score >= this.commandMatchThreshold) {
        bestMatch.command.action();
      }
    }
  }

  public startListening() {
    if (!this.recognition) {
      console.error('Speech recognition not initialized.');
      return;
    }

    try {
      this.recognition.start();
      this.isListening = true;
      if (this.onListeningChangeCallback) {
        this.onListeningChangeCallback(true);
      }
      console.log('Speech recognition started');
    } catch (error) {
      console.error('Error starting speech recognition:', error);
    }
  }

  public stopListening() {
    if (!this.recognition || !this.isListening) return;

    try {
      this.recognition.stop();
      this.isListening = false;
      if (this.onListeningChangeCallback) {
        this.onListeningChangeCallback(false);
      }
      console.log('Speech recognition stopped');
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  }

  public isSupported(): boolean {
    return ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);
  }

  public clearCommands() {
    this.commands = [];
    return this;
  }
}

// Create a singleton instance
const speechRecognition = new SpeechRecognitionService();
export default speechRecognition;
