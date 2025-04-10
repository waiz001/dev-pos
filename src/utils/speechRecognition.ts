
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
  private commandMatchThreshold: number = 0.65; // Lower threshold for better matching
  private restartTimeout: any = null;

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
      this.recognition.maxAlternatives = 5; // Increased alternatives for better accuracy
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
        phrases: ["go home", "dashboard", "main screen", "main menu", "back to home", "homepage", "home page"],
        action: () => {
          // Navigate without page reload
          this.navigateWithoutReload("/");
        }
      },
      {
        command: "logout",
        phrases: ["sign out", "exit system", "log out", "sign me out", "log me out", "exit application"],
        action: () => {
          // Navigate without page reload
          this.navigateWithoutReload("/login");
        }
      },
      {
        command: "products",
        phrases: ["show products", "goto products", "product list", "product page", "view products", "open products", "products page"],
        action: () => {
          this.navigateWithoutReload("/products");
        }
      },
      {
        command: "orders",
        phrases: ["show orders", "goto orders", "order list", "order page", "view orders", "open orders", "orders page"],
        action: () => {
          this.navigateWithoutReload("/orders");
        }
      },
      {
        command: "customers",
        phrases: ["show customers", "goto customers", "customer list", "customer page", "view customers", "open customers", "customers page"],
        action: () => {
          this.navigateWithoutReload("/customers");
        }
      },
      {
        command: "reports",
        phrases: ["show reports", "goto reports", "report list", "report page", "view reports", "open reports", "reports page"],
        action: () => {
          this.navigateWithoutReload("/reports");
        }
      },
      {
        command: "settings",
        phrases: ["show settings", "goto settings", "setting page", "preferences", "view settings", "open settings", "settings page"],
        action: () => {
          this.navigateWithoutReload("/settings");
        }
      },
      {
        command: "users",
        phrases: ["show users", "goto users", "user list", "user page", "view users", "open users", "users page"],
        action: () => {
          this.navigateWithoutReload("/users");
        }
      },
      {
        command: "pos",
        phrases: ["open pos", "start pos", "point of sale", "goto pos", "pos page", "view pos", "pos session", "register"],
        action: () => {
          this.navigateWithoutReload("/pos-session");
        }
      },
      {
        command: "shop",
        phrases: ["shop mode", "open shop", "goto shop", "shop page", "view shop", "pos shop", "shop view"],
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

  // Enhanced string similarity algorithm for better matching
  private stringSimilarity(s1: string, s2: string): number {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    if (longer.length === 0) {
      return 1.0;
    }
    
    // Special case handling for short button commands like "Pay", "Add", etc.
    if (shorter.length <= 4 && longer.toLowerCase().includes(shorter.toLowerCase())) {
      return 0.95; // Higher score for exact short matches
    }
    
    // Check if the shorter string is contained within the longer one
    if (longer.toLowerCase().includes(shorter.toLowerCase())) {
      return 0.9;
    }
    
    // Check for words match with improved algorithm
    const s1Words = s1.toLowerCase().split(' ').filter(w => w.length > 1);
    const s2Words = s2.toLowerCase().split(' ').filter(w => w.length > 1);
    
    // Count matching words
    let matchCount = 0;
    for (const word of s1Words) {
      if (s2Words.includes(word)) {
        matchCount++;
      }
    }
    
    // If we have word matches, calculate a score
    if (matchCount > 0) {
      return matchCount / Math.max(s1Words.length, s2Words.length);
    }
    
    // If no direct word matches, try character-level matching
    // Levenshtein distance implementation (simplified)
    const editDistance = (a: string, b: string): number => {
      if (a.length === 0) return b.length;
      if (b.length === 0) return a.length;
      
      const matrix = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(null));
      
      for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
      for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
      
      for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
          const cost = a[i - 1] === b[j - 1] ? 0 : 1;
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1,      // deletion
            matrix[i][j - 1] + 1,      // insertion
            matrix[i - 1][j - 1] + cost // substitution
          );
        }
      }
      
      return matrix[a.length][b.length];
    };
    
    const distance = editDistance(s1.toLowerCase(), s2.toLowerCase());
    const maxLen = Math.max(s1.length, s2.length);
    
    // Convert edit distance to similarity (0-1 scale)
    return 1 - (distance / maxLen);
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
    
    // Clear any existing restart timeout
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }
  }

  private handleError(event: SpeechRecognitionErrorEvent) {
    console.error('Speech recognition error:', event.error);
    this.isListening = false;
    if (this.onListeningChangeCallback) {
      this.onListeningChangeCallback(false);
    }
    
    // Clear any existing restart timeout
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
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
    // Check for special POS buttons that might need more exact matching
    const posButtonCommands = ["pay", "select customer", "payment method", "all orders", "recovery", "close pos"];
    for (const buttonCmd of posButtonCommands) {
      if (transcript.includes(buttonCmd)) {
        // Find and execute the command directly
        const match = [...this.commands, ...this.globalCommands].find(cmd => 
          cmd.command.toLowerCase() === buttonCmd ||
          cmd.phrases?.some(phrase => phrase.toLowerCase() === buttonCmd)
        );
        
        if (match) {
          match.action();
          return;
        }
      }
    }
    
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
      // If already listening, stop first to reset
      if (this.isListening) {
        this.recognition.stop();
      }
      
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
      
      // Clear any existing restart timeout
      if (this.restartTimeout) {
        clearTimeout(this.restartTimeout);
        this.restartTimeout = null;
      }
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
