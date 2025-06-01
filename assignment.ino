#include <LiquidCrystal.h>

// LCD Pins Configuration
const int RS = 7, EN = 8, D4 = 9, D5 = 10, D6 = 11, D7 = 12;
LiquidCrystal lcd(RS, EN, D4, D5, D6, D7);

// Status LED and backlight sensor
const int STATUS_LED = 13;
const int BACKLIGHT_SENSOR = A0;

// LCD Health Monitoring
bool lcdFunctional = true;
unsigned long lastBlinkTime = 0;
bool ledState = LOW;

void setup() {
  Serial.begin(9600);
  pinMode(STATUS_LED, OUTPUT);
  pinMode(BACKLIGHT_SENSOR, INPUT);
  
  // Initialize LCD with safety checks
  initializeLCD();
}

void initializeLCD() {
  // Attempt LCD initialization
  lcd.begin(16, 2);
  lcd.print("Initializing...");
  
  // Verify backlight by checking sensor
  delay(500);  // Allow time for backlight to stabilize
  int sensorValue = analogRead(BACKLIGHT_SENSOR);
  
  if (sensorValue > 500) {  // Backlight detected
    lcd.clear();
    lcd.print("System Ready");
    lcd.setCursor(0, 1);
    lcd.print("Waiting...");
    digitalWrite(STATUS_LED, HIGH);  // Confirm initialization
    delay(1000);
    digitalWrite(STATUS_LED, LOW);
  } else {
    // LCD failure mode - blink LED indefinitely
    lcdFunctional = false;
    while (true) {
      digitalWrite(STATUS_LED, HIGH);
      delay(100);
      digitalWrite(STATUS_LED, LOW);
      delay(100);
    }
  }
}

bool verifyBacklight() {
  // Check if backlight is functioning
  int sensorValue = analogRead(BACKLIGHT_SENSOR);
  return (sensorValue > 500);  // Threshold for light detection
}

void displayData(String hexData) {
  if (!lcdFunctional) return;
  
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Encrypted Data:");
  
  // Split data into two lines if needed
  lcd.setCursor(0, 1);
  if (hexData.length() <= 16) {
    lcd.print(hexData);
  } else {
    // Display first 16 characters on line 1
    lcd.print(hexData.substring(0, 16));
    // Move to second line for remaining data
    lcd.setCursor(0, 0);
    lcd.print(hexData.substring(0, 16));
    lcd.setCursor(0, 1);
    lcd.print(hexData.substring(16, 32));
  }
}

void loop() {
  // Handle incoming serial data
  if (Serial.available()) {
    String data = Serial.readStringUntil('\n');
    data.trim();
    
    if (lcdFunctional) {
      displayData(data);
      delay(100);  // Allow time for display update
      
      // Verify backlight functionality
      if (verifyBacklight()) {
        Serial.println("ACK");  // Acknowledge success
        digitalWrite(STATUS_LED, HIGH);  // Confirm display
        delay(500);
        digitalWrite(STATUS_LED, LOW);
      } else {
        Serial.println("LCD_ERROR");  // Report failure
        // Error indication pattern: 3 quick blinks
        for (int i = 0; i < 3; i++) {
          digitalWrite(STATUS_LED, HIGH);
          delay(100);
          digitalWrite(STATUS_LED, LOW);
          delay(100);
        }
      }
    }
  }
  
  // Idle-state slow blink when waiting
  if (lcdFunctional && millis() - lastBlinkTime > 1000) {
    ledState = !ledState;
    digitalWrite(STATUS_LED, ledState);
    lastBlinkTime = millis();
  }
}