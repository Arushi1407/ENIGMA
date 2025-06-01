import serial
import time
import binascii

# Simple XOR encryption function
def xor_encrypt(data, key=0x55):
    """Encrypt data using XOR cipher"""
    encrypted = bytes([b ^ key for b in data.encode()])
    return binascii.hexlify(encrypted).decode()

# Initialize serial connection
ser = serial.Serial('COM3', 9600, timeout=2)  # Update COM port

def main():
    print("Serial Communication & LCD Display System")
    print("----------------------------------------")
    print("Safety Indicators:")
    print("- LED steady: LCD functioning")
    print("- LED blinking: LCD initialization failed")
    print("- LED flickering: Data display error")
    print("- LED off: Idle state")
    print("----------------------------------------")
    
    try:
        while True:
            user_input = input("\nEnter number to encrypt (or 'exit' to quit): ")
            if user_input.lower() == 'exit':
                break
                
            encrypted = xor_encrypt(user_input)
            print(f"Encrypted: {encrypted}")
            
            # Send data to Arduino
            ser.write(f"{encrypted}\n".encode())
            print("Data sent to Arduino")
            
            # Wait for acknowledgment
            start_time = time.time()
            ack_received = False
            while time.time() - start_time < 2:  # 2-second timeout
                if ser.in_waiting:
                    response = ser.readline().decode().strip()
                    if response == "ACK":
                        print("Display successful")
                        ack_received = True
                        break
                    elif response == "LCD_ERROR":
                        print("WARNING: LCD malfunction detected!")
                        ack_received = True
                        break
            
            if not ack_received:
                print("ERROR: No response from Arduino - check connections")
                
    except KeyboardInterrupt:
        pass
    finally:
        ser.close()
        print("\nSerial connection closed")

if __name__ == "__main__":
    main()



"""
import serial
import time
# Replace 'COM3' with your Arduino port ('/dev/ttyUSB0' or '/dev/ttyACM0' on Linux/macOS)
arduino = serial.Serial('COM3', 9600, timeout=1)
time.sleep(2) # Give Arduino time to reset
def send_digit(n):
if 0 <= n <= 9:
arduino.write(str(n).encode())
print(f"Sent: {n}")
else:
print("Only digits 0–9 are allowed")
while(1):
ch=int(input("Enter the digit"))
send_digit(ch)
"""

"""
const int segmentPins[7] = {2, 3, 4, 5, 6, 7, 8};
// Segment patterns for digits 0-9
const byte digits[10][7] = {
{1,1,1,1,1,1,0}, // 0
{0,1,1,0,0,0,0}, // 1
{1,1,0,1,1,0,1}, // 2
{1,1,1,1,0,0,1}, // 3
{0,1,1,0,0,1,1}, // 4
{1,0,1,1,0,1,1}, // 5
{1,0,1,1,1,1,1}, // 6
{1,1,1,0,0,0,0}, // 7
{1,1,1,1,1,1,1}, // 8
{1,1,1,1,0,1,1} // 9
};
void setup() {
for (int i = 0; i < 7; i++) {
pinMode(segmentPins[i], OUTPUT);
}
Serial.begin(9600);
}
void displayDigit(int digit) {
if (digit < 0 || digit > 9) return;
for (int i = 0; i < 7; i++) {
digitalWrite(segmentPins[i], digits[digit][i]);
}
}
void loop() {
if (Serial.available() > 0) {
char ch = Serial.read();
Serial.println(ch);
if (ch >= '0' && ch <= '9') {
displayDigit(ch - '0');
}
}
}
"""