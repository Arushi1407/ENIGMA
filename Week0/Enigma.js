// Enigma.js - Main simulation
const EnigmaConstants = {
    // Rotor configurations
    ROTOR_I: { wiring: "EKMFLGDQVZNTOWYHXUSPAIBRCJ", notch: "Q" },
    ROTOR_II: { wiring: "AJDKSIRUXBLHWTMCQGZNPYFVOE", notch: "E" },
    ROTOR_III: { wiring: "BDFHJLCPRTXVZNYEIWGAKMUSQO", notch: "V" },
    REFLECTOR: "YRUHQSLDPXNGOKMIEBFZCWVJAT",
  
    // UI positions (example coordinates)
    KEY_POSITIONS: {
      A: {x: 100, y: 500}, B: {x: 130, y: 500}, C: {x: 160, y: 500},
      // ... Add positions for all 26 letters
    },
    LAMP_POSITIONS: {
      A: {x: 100, y: 100}, B: {x: 130, y: 100}, C: {x: 160, y: 100},
      // ... Add positions for all 26 letters
    },
    ROTOR_POSITIONS: [{x: 300, y: 250}, {x: 400, y: 250}, {x: 500, y: 250}],
    KEY_RADIUS: 15,
    COLORS: {
      key: "#666666",
      lamp_off: "#444444",
      lamp_on: "#FFFF00",
      rotor_bg: "#DDDDDD"
    }
  };
  
  class Rotor {
    constructor(wiring, notch) {
      this.wiring = wiring;
      this.notch = notch.charCodeAt(0) - 65;
      this.position = 0;
    }
  
    forwardSignal(input) {
      return (this.wiring.charCodeAt((input + this.position) % 26) - 65 - this.position + 26) % 26;
    }
  
    reverseSignal(input) {
      const index = (this.wiring.indexOf(String.fromCharCode(input + 65)) - this.position + 26) % 26;
      return index;
    }
  
    step() { this.position = (this.position + 1) % 26; }
    isAtNotch() { return this.position === this.notch; }
  }
  
  class EnigmaMachine {
    constructor() {
      this.rotors = [
        new Rotor(EnigmaConstants.ROTOR_I.wiring, EnigmaConstants.ROTOR_I.notch),
        new Rotor(EnigmaConstants.ROTOR_II.wiring, EnigmaConstants.ROTOR_II.notch),
        new Rotor(EnigmaConstants.ROTOR_III.wiring, EnigmaConstants.ROTOR_III.notch)
      ];
      this.reflector = EnigmaConstants.REFLECTOR;
      this.plugboard = Array.from({length: 26}, (_, i) => i);
    }
  
    encrypt(char) {
      this.stepRotors();
      let signal = char.toUpperCase().charCodeAt(0) - 65;
  
      // Signal path
      signal = this.plugboard[signal];
      for (let i = this.rotors.length - 1; i >= 0; i--) signal = this.rotors[i].forwardSignal(signal);
      signal = this.reflector.charCodeAt(signal) - 65;
      for (let i = 0; i < this.rotors.length; i++) signal = this.rotors[i].reverseSignal(signal);
      signal = this.plugboard[signal];
  
      return String.fromCharCode(signal + 65);
    }
  
    stepRotors() {
      const stepThird = true;
      const stepSecond = this.rotors[2].isAtNotch();
      const stepFirst = this.rotors[1].isAtNotch();
  
      if (stepThird) this.rotors[2].step();
      if (stepSecond) this.rotors[1].step();
      if (stepFirst) this.rotors[0].step();
    }
  }
  
  function createEnigmaUI(gw) {
    const enigma = new EnigmaMachine();
    const lamps = {};
  
    // Create keyboard
    Object.entries(EnigmaConstants.KEY_POSITIONS).forEach(([letter, pos]) => {
      const key = new GOval(pos.x, pos.y, 
                          EnigmaConstants.KEY_RADIUS*2, 
                          EnigmaConstants.KEY_RADIUS*2);
      key.setFilled(true);
      key.setColor(EnigmaConstants.COLORS.key);
      key.addEventListener("click", () => {
        const result = enigma.encrypt(letter);
        lamps[result].setColor(EnigmaConstants.COLORS.lamp_on);
        setTimeout(() => {
          lamps[result].setColor(EnigmaConstants.COLORS.lamp_off);
          gw.redraw();
        }, 300);
      });
      gw.add(key);
    });
  
    // Create lamps
    Object.entries(EnigmaConstants.LAMP_POSITIONS).forEach(([letter, pos]) => {
      const lamp = new GOval(pos.x, pos.y, 
                           EnigmaConstants.KEY_RADIUS*2, 
                           EnigmaConstants.KEY_RADIUS*2);
      lamp.setFilled(true);
      lamp.setColor(EnigmaConstants.COLORS.lamp_off);
      gw.add(lamp);
      lamps[letter] = lamp;
    });
  
    // Create rotor displays
    enigma.rotors.forEach((rotor, i) => {
      const pos = EnigmaConstants.ROTOR_POSITIONS[i];
      const bg = new GRect(pos.x, pos.y, 40, 40);
      const label = new GLabel(String.fromCharCode(65 + rotor.position), pos.x + 10, pos.y + 25);
      bg.setFilled(true);
      bg.setColor(EnigmaConstants.COLORS.rotor_bg);
      
      bg.addEventListener("click", () => {
        rotor.step();
        label.setText(String.fromCharCode(65 + rotor.position));
        gw.redraw();
      });
  
      gw.add(bg);
      gw.add(label);
    });
  }
  
  // Initialize simulation
  function EnigmaApp() {
    const gw = new GWindow(800, 600);
    createEnigmaUI(gw);
  }
  
  window.onload = EnigmaApp;