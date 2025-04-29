#include <Arduino.h>
#include <Wire.h>
#include <WiFiST.h>
#include <SPI.h>
#include <ArduinoHttpClient.h>
#include <RunningMedian.h> // Library by Rob Tillaart (https://github.com/RobTillaart/RunningMedian)
#include <secrets.h> // create your own secrets.h file

// BH1750 I2C Light Sensor
#define BH1750_ADDR 0x23
#define BH1750_CONTINUOUS_HIGH_RES_MODE 0x10

// MAX4466 microphone pin
#define MIC_PIN PA0 // Connect to analog pin (adjust as needed for your STM32 board)

// WiFi module pins for STM32 B-L4S51-IOT01A
SPIClass SPI_3(PC12, PC11, PC10);
WiFiClass WiFi(&SPI_3, PE0, PE1, PE8, PB13);

// Function prototypes
void connectWifi();
// Light sensor functions
void BH1750_init();
float BH1750_readLightLevel();
String getLightDescription(float lux);
// Microphone functions
int readMicrophoneLevel();
String getSoundDescription(int soundLevel);
// ThingSpeak function
void sendDataToThingSpeak(float lux, int soundLevel, String lightDesc, String soundDesc);

// Microphone sampling parameters
const int sampleWindow = 50; // Sample window width in ms (50 ms = 20Hz)
const int numReadings = 100; // Number of readings to take

void setup() {
  Serial.begin(115200);
  delay(2000);
  Serial.println("STM32 Environmental Monitor with ThingSpeak");

  // Initialize I2C for BH1750 (default pins)
  Wire.begin();

  // Initialize BH1750 sensor
  BH1750_init();
  Serial.println("BH1750 Light Sensor Initialized");
  
  // Initialize analog pin for microphone
  pinMode(MIC_PIN, INPUT);
  Serial.println("MAX4466 Microphone Initialized");
  
  connectWifi();  // Connect to Wi-Fi
}

void connectWifi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);

  // Convert const char* to char* as required by WiFi.begin
  char ssid_non_const[50];
  strcpy(ssid_non_const, ssid);
  
  WiFi.begin(ssid_non_const, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nWiFi connection failed");
  }
}

void loop() {
  // Read light level
  float lux = BH1750_readLightLevel();
  String lightDescription = getLightDescription(lux);
  
  Serial.print("Light Intensity: ");
  if (lux >= 0) {
    Serial.print(lux);
    Serial.println(" lux");
    Serial.print("Light Description: ");
    Serial.println(lightDescription);
  } else {
    Serial.println("Error reading BH1750");
  }

  // Read sound level
  int soundLevel = readMicrophoneLevel();
  String soundDescription = getSoundDescription(soundLevel);
  
  Serial.print("Sound Level: ");
  Serial.println(soundLevel);
  Serial.print("Sound Description: ");
  Serial.println(soundDescription);

  // Only send data if WiFi is connected
  if (WiFi.status() == WL_CONNECTED) {
    sendDataToThingSpeak(lux, soundLevel, lightDescription, soundDescription);
  } else {
    Serial.println("WiFi disconnected! Reconnecting...");
    connectWifi();
  }

  delay(15000); // Wait 15 seconds between updates (ThingSpeak has a 15-second update limit)
}

// Initialize BH1750 light sensor
void BH1750_init() {
  Wire.beginTransmission(BH1750_ADDR);
  Wire.write(BH1750_CONTINUOUS_HIGH_RES_MODE);
  byte error = Wire.endTransmission();
  if (error != 0) {
    Serial.print("I2C Error during BH1750 init: ");
    Serial.println(error);
  }
  delay(200);
}

// Read light level from BH1750
float BH1750_readLightLevel() {
  uint16_t rawValue = 0;
  Wire.requestFrom(BH1750_ADDR, 2);
  if (Wire.available() == 2) {
    rawValue = Wire.read();
    rawValue <<= 8;
    rawValue |= Wire.read();
    return rawValue / 1.2;
  } else {
    Serial.println("BH1750 I2C Read Error!");
    return -1.0;
  }
}

// Return a human-readable description based on lux value
String getLightDescription(float lux) {
  if (lux < 1) return "Very Dark";
  else if (lux < 10) return "Dim";
  else if (lux < 50) return "Low Light";
  else if (lux < 200) return "Moderate";
  else if (lux < 500) return "Bright";
  else if (lux < 1000) return "Very Bright";
  else if (lux < 10000) return "Outdoor";
  else if (lux < 50000) return "Daylight";
  else return "Full Sunlight";
}

// Read sound level from MAX4466 microphone
int readMicrophoneLevel() {
  // Use RunningMedian to filter out noise
  RunningMedian samples = RunningMedian(numReadings);
  
  unsigned long startMillis = millis(); // Start of sample window
  
  // Collect samples for the sample window
  while (millis() - startMillis < sampleWindow) {
    int sample = analogRead(MIC_PIN);
    samples.add(sample);
  }
  
  // Calculate the average and map to a 0-100 scale
  int avg = samples.getAverage();
  int soundLevel = map(avg, 0, 4095, 0, 100); // 4095 is max for 12-bit ADC on STM32
  
  // Ensure the value is within 0-100 range
  soundLevel = constrain(soundLevel, 0, 100);
  
  return soundLevel;
}

// Return a human-readable description based on sound level
String getSoundDescription(int soundLevel) {
  if (soundLevel < 20) return "Very Quiet";
  else if (soundLevel < 40) return "Quiet";
  else if (soundLevel < 60) return "Moderate";
  else if (soundLevel < 80) return "Loud";
  else return "Very Loud";
}

// Send both light and sound data to ThingSpeak
void sendDataToThingSpeak(float lux, int soundLevel, String lightDesc, String soundDesc) {
  Serial.println("Sending data to ThingSpeak...");

  // Use regular WiFiClient
  WiFiClient client;
  
  // Create HTTP client for ThingSpeak
  HttpClient http(client, thingSpeakHost, thingSpeakPort);

  String encodedMetadata = "Light:" + lightDesc + ",%20Sound:" + soundDesc;
  encodedMetadata.replace(" ", "%20"); 
  
  // Create the data string for ThingSpeak
  // field1 = light level, field2 = sound level
  String data = "api_key=" + String(writeAPIKey) + 
                "&field1=" + String(lux, 2) + 
                "&field2=" + String(soundLevel) +
                "&metadata=" + encodedMetadata;
  
  Serial.print("Data string: ");
  Serial.println(data);

  // Send the request
  http.beginRequest();
  http.post("/update");
  http.sendHeader("Content-Type", "application/x-www-form-urlencoded");
  http.sendHeader("Content-Length", String(data.length()));
  http.beginBody();
  http.print(data);
  http.endRequest();

  Serial.println("Getting response...");

  // Wait for response with timeout
  unsigned long timeout = millis();
  while (!http.available()) {
    if (millis() - timeout > 10000) { // 10-second timeout
      Serial.println("Response timeout!");
      return;
    }
  }

  // Read the response
  int statusCode = http.responseStatusCode();
  Serial.print("HTTP Response code: ");
  Serial.println(statusCode);

  String response = http.responseBody();
  Serial.print("Response: ");
  Serial.println(response);

  Serial.println("HTTP client stopped");
}