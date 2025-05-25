/*
 * File: Enigma.js
 * ---------------
 * This program implements a graphical simulation of the Enigma machine.
 */

import "./graphics.js";
import "./EnigmaConstants.js";

/* Main program */


function Enigma() {
   var enigmaImage = GImage("EnigmaTopView.png");
   var gw = GWindow(enigmaImage.getWidth(), enigmaImage.getHeight());
   gw.add(enigmaImage);
   runEnigmaSimulation(gw);

}

// You are responsible for filling in the rest of the code.  Your
// implementation of runEnigmaSimulation should perform the
// following operations:
//
// 1. Create an object that encapsulates the state of the Enigma machine.
// 2. Create and add graphical objects that sit on top of the image.
// 3. Add listeners that forward mouse events to those objects.
class EnigmaState {
   constructor() {
       this.rotors = [
           new Rotor(EnigmaConstants.ROTOR_I_WIRING, EnigmaConstants.ROTOR_I_NOTCH),
           new Rotor(EnigmaConstants.ROTOR_II_WIRING, EnigmaConstants.ROTOR_II_NOTCH),
           new Rotor(EnigmaConstants.ROTOR_III_WIRING, EnigmaConstants.ROTOR_III_NOTCH)
       ];
       this.reflector = EnigmaConstants.REFLECTOR_WIRING;
       this.plugboard = new Plugboard();
   }

   processKeyPress(letter) {
       this.stepRotors();
       let signal = letter.charCodeAt(0) - 'A'.charCodeAt(0);
       signal = this.plugboard.process(signal);
       signal = this.passThroughRotorsForward(signal);
       signal = this.passThroughReflector(signal);
       signal = this.passThroughRotorsReverse(signal);
       signal = this.plugboard.process(signal);
       return String.fromCharCode('A'.charCodeAt(0) + signal);
   }

   stepRotors() {
       let stepRotor3 = true;
       let stepRotor2 = this.rotors[2].isAtNotch();
       let stepRotor1 = this.rotors[1].isAtNotch();

       if (stepRotor3) this.rotors[2].step();
       if (stepRotor2) this.rotors[1].step();
       if (stepRotor1) this.rotors[0].step();
   }

   // Additional methods for rotor signal processing...
}
class Rotor {
   constructor(wiring, notch) {
       this.wiring = wiring;
       this.notch = notch.charCodeAt(0) - 'A'.charCodeAt(0);
       this.position = 0;
   }

   forwardSignal(signal) {
       let pos = (signal + this.position) % 26;
       let output = this.wiring.charCodeAt(pos) - 'A'.charCodeAt(0);
       return (output - this.position + 26) % 26;
   }

   reverseSignal(signal) {
       let pos = (signal + this.position) % 26;
       let input = String.fromCharCode('A'.charCodeAt(0) + pos);
       let output = this.wiring.indexOf(input);
       return (output - this.position + 26) % 26;
   }

   step() { this.position = (this.position + 1) % 26; }
   isAtNotch() { return this.position === this.notch; }
}

class Plugboard {
   constructor() {
       this.map = Array.from({length: 26}, (_, i) => i);
   }

   process(signal) { return this.map[signal]; }
}
function runEnigmaSimulation(gw) {
   const enigmaState = new EnigmaState();
   const lamps = {};

   // Create keys
   'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(letter => {
       const key = new GOval(EnigmaConstants.KEY_RADIUS * 2, EnigmaConstants.KEY_RADIUS * 2);
       key.setPosition(EnigmaConstants.KEY_POSITIONS[letter].x, EnigmaConstants.KEY_POSITIONS[letter].y);
       key.setFilled(true);
       key.setColor(EnigmaConstants.KEY_OFF_COLOR);
       key.addEventListener("click", () => handleKeyPress(letter, lamps, enigmaState));
       gw.add(key);
   });

   // Create lamps
   'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(letter => {
       const lamp = new GOval(EnigmaConstants.LAMP_RADIUS * 2, EnigmaConstants.LAMP_RADIUS * 2);
       lamp.setPosition(EnigmaConstants.LAMP_POSITIONS[letter].x, EnigmaConstants.LAMP_POSITIONS[letter].y);
       lamp.setFilled(true);
       lamp.setColor(EnigmaConstants.LAMP_OFF_COLOR);
       gw.add(lamp);
       lamps[letter] = lamp;
   });

   // Create rotor displays
   createRotorDisplay(gw, EnigmaConstants.ROTOR1_POSITION, 0, enigmaState);
   createRotorDisplay(gw, EnigmaConstants.ROTOR2_POSITION, 1, enigmaState);
   createRotorDisplay(gw, EnigmaConstants.ROTOR3_POSITION, 2, enigmaState);
}

function createRotorDisplay(gw, position, rotorIndex, enigmaState) {
   const rotor = enigmaState.rotors[rotorIndex];
   const compound = new GCompound();
   const label = new GLabel(String.fromCharCode('A'.charCodeAt(0) + rotor.position));
   label.setFont("14px Arial");
   compound.add(new GRect(40, 40));
   compound.add(label);
   compound.setPosition(position.x, position.y);
   compound.addEventListener("click", () => {
       rotor.position = (rotor.position + 1) % 26;
       label.setText(String.fromCharCode('A'.charCodeAt(0) + rotor.position));
   });
   gw.add(compound);
}
function handleKeyPress(letter, lamps, enigmaState) {
   const encryptedLetter = enigmaState.processKeyPress(letter);
   const lamp = lamps[encryptedLetter];
   lamp.setColor(EnigmaConstants.LAMP_ON_COLOR);
   setTimeout(() => lamp.setColor(EnigmaConstants.LAMP_OFF_COLOR), 500);
}


