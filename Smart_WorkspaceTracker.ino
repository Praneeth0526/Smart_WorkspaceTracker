#include <Arduino.h>
#include <Wire.h>
#include <WiFiST.h>
#include <SPI.h>
#include <ArduinoHttpClient.h>
#include <RunningMedian.h>     // Library by Rob Tillaart
#include <Adafruit_HTU21DF.h>  // Library by Adafruit for HTU21D/SHT21
#include <DHT.h>// Library for DHT11 temperature sensor
#include <secrets.h>           // create your own secrets.h file

// BH1750 I2C Light Sensor
#define BH1750_ADDR 0x23        // Try 0x5C if this doesn't work
#define BH1750_CONTINUOUS_HIGH_RES_MODE 0x10

// MAX4466 microphone pin
#define MIC_PIN PC0             // Connect to analog pin (adjust as needed)

// Temperature Sensor pin (OneWire)
#define DHT11_PIN PA1     // Connect temperature sensor data pin here
#define DHTTYPE DHT11      // DHT11 sensor type

DHT dht(DHT11_PIN, DHTTYPE); // Initialize DHT11 object

// WiFi module pins for STM32 B-L4S51-IOT01A
SPIClass SPI_3(PC12, PC11, PC10);
WiFiClass WiFi(&SPI_3, PE0, PE1, PE8, PB13);

// Initialize library objects
Adafruit_HTU21DF htu;           // Create humidity sensor object


// Function prototypes
void connectWifi();
void scanI2CDevices();
// Light sensor functions
void BH1750_init();
float BH1750_readLightLevel();
String getLightDescription(float lux);
// Microphone functions
int readMicrophoneLevel();
String getSoundDescription(int soundLevel);
// New sensor functions
bool initializeHumiditySensor();
float readHumidity();
String getHumidityDescription(float humidity);
float readTemperature();
String getTemperatureDescription(float temperature);
// ThingSpeak function
void sendDataToThingSpeak(float lux, int soundLevel, float humidity, float temperature,
                          String lightDesc, String soundDesc, String humidityDesc, String tempDesc);

// Microphone sampling parameters
const int sampleWindow = 50;    // Sample window width in ms (50 ms = 20Hz)
const int numReadings = 100;    // Number of readings to take

void setup() {
  Serial.begin(115200);
  delay(2000);
  Serial.println("STM32 Environmental Monitor with ThingSpeak");

  // Initialize I2C for sensors
  Wire.begin();
  
  // Scan for I2C devices
  scanI2CDevices();

  // Initialize BH1750 sensor
  BH1750_init();
  Serial.println("BH1750 Light Sensor Initialized");
  
  // Initialize humidity sensor
  if (initializeHumiditySensor()) {
    Serial.println("Humidity Sensor Initialized");
  } else {
    Serial.println("Failed to initialize Humidity Sensor!");
  }
  
  // Initialize temperature sensor
  dht.begin();
  Serial.println("Temperature Sensor Initialized");
  
  // Initialize analog pin for microphone
  pinMode(MIC_PIN, INPUT);
  Serial.println("MAX4466 Microphone Initialized");
  
  // Connect to Wi-Fi
  connectWifi();
}

// Scan for I2C devices to find correct address
void scanI2CDevices() {
  byte error, address;
  int deviceCount = 0;
  
  Serial.println("Scanning for I2C devices...");
  
  for(address = 1; address < 127; address++) {
    Wire.beginTransmission(address);
    error = Wire.endTransmission();
    
    if (error == 0) {
      Serial.print("I2C device found at address 0x");
      if (address < 16) {
        Serial.print("0");
      }
      Serial.println(address, HEX);
      deviceCount++;
    }
    else if (error == 4) {
      Serial.print("Unknown error at address 0x");
      if (address < 16) {
        Serial.print("0");
      }
      Serial.println(address, HEX);
    }
  }
  
  if (deviceCount == 0) {
    Serial.println("No I2C devices found!");
  } else {
    Serial.print("Found ");
    Serial.print(deviceCount);
    Serial.println(" I2C device(s)");
  }
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
  // Read light level (with better error handling)
  float lux = BH1750_readLightLevel();
  String lightDescription;
  
  Serial.print("Light Intensity: ");
  if (lux >= 0) {
    Serial.print(lux);
    Serial.println(" lux");
    lightDescription = getLightDescription(lux);
    Serial.print("Light Description: ");
    Serial.println(lightDescription);
  } else {
    Serial.println("Error reading BH1750");
    lux = -1; // Keep negative value to indicate error
    lightDescription = "Sensor Error";
  }

  // Read sound level
  int soundLevel = readMicrophoneLevel();
  String soundDescription = getSoundDescription(soundLevel);
  
  Serial.print("Sound Level: ");
  Serial.println(soundLevel);
  Serial.print("Sound Description: ");
  Serial.println(soundDescription);

  // Read humidity
  float humidity = readHumidity();
  String humidityDescription = getHumidityDescription(humidity);
  
  Serial.print("Humidity: ");
  if (humidity >= 0) {
    Serial.print(humidity);
    Serial.println(" %");
    Serial.print("Humidity Description: ");
    Serial.println(humidityDescription);
  } else {
    Serial.println("Error reading humidity sensor");
  }
  
  // Read temperature
  float temperature = readTemperature();
  String temperatureDescription = getTemperatureDescription(temperature);
  
  Serial.print("Temperature: ");
  if (!isnan(temperature)) {
    Serial.print(temperature);
    Serial.println(" °C");
    Serial.print("Temperature Description: ");
    Serial.println(temperatureDescription);
  } else {
    Serial.println("Error reading temperature sensor");
    temperature = -1000; // Error value
  }

  // Only send data if WiFi is connected
  if (WiFi.status() == WL_CONNECTED) {
    sendDataToThingSpeak(lux, soundLevel, humidity, temperature,
                         lightDescription, soundDescription, humidityDescription, temperatureDescription);
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

// Initialize humidity sensor
bool initializeHumiditySensor() {
  if (htu.begin()) {
    return true;
  }
  return false;
}

// Read humidity from HTU21D/SHT21 sensor
float readHumidity() {
  float h = htu.readHumidity();
  if (isnan(h)) {
    Serial.println("Failed to read humidity!");
    return -1;
  }
  return h;
}

// Return a human-readable description based on humidity value
String getHumidityDescription(float humidity) {
  if (humidity < 0) return "Sensor Error";
  else if (humidity < 30) return "Very Dry";
  else if (humidity < 40) return "Dry";
  else if (humidity < 60) return "Comfortable";
  else if (humidity < 70) return "Humid";
  else return "Very Humid";
}

// Read temperature from DS18B20 sensor
// Read temperature from DHT11 sensor
float readTemperature() {
    float tempC = dht.readTemperature(); // returns temperature in Celsius
    return tempC;
}

// Return a human-readable description based on temperature value
String getTemperatureDescription(float tempC) {
  if (isnan(tempC)) return "Sensor Error";
  else if (tempC < 0) return "Freezing";
  else if (tempC < 10) return "Very Cold";
  else if (tempC < 20) return "Cool";
  else if (tempC < 25) return "Comfortable";
  else if (tempC < 30) return "Warm";
  else if (tempC < 35) return "Hot";
  else return "Very Hot";
}

// Send all sensor data to ThingSpeak
void sendDataToThingSpeak(float lux, int soundLevel, float humidity, float temperature,
                          String lightDesc, String soundDesc, String humidityDesc, String tempDesc) {
  Serial.println("Sending data to ThingSpeak...");

  // Use regular WiFiClient
  WiFiClient client;
  
  // Create HTTP client for ThingSpeak
  HttpClient http(client, thingSpeakHost, thingSpeakPort);

  // Build metadata string with descriptions from all sensors
  String encodedMetadata = "";
  
  // Only include working sensors in metadata
  if (lux >= 0) {
    encodedMetadata += "Light:" + lightDesc;
  }
  
  encodedMetadata += encodedMetadata.length() > 0 ? ",%20" : "";
  encodedMetadata += "Sound:" + soundDesc;
  
  if (humidity >= 0) {
    encodedMetadata += ",%20Humidity:" + humidityDesc;
  }
  
  if (!isnan(temperature) && temperature > -999) {
    encodedMetadata += ",%20Temp:" + tempDesc;
  }
  
  encodedMetadata.replace(" ", "%20");
  
  // Create the data string for ThingSpeak
  // field1 = light, field2 = sound, field3 = humidity, field4 = temperature
  String data = "api_key=" + String(writeAPIKey);
  
  // Only include data from working sensors
  if (lux >= 0) {
    data += "&field1=" + String(lux, 2);
  }
  
  data += "&field2=" + String(soundLevel);
  
  if (humidity >= 0) {
    data += "&field3=" + String(humidity, 1);
  }
  
  if (!isnan(temperature)&& temperature > -999) {
    data += "&field4=" + String(temperature, 2);
  }
  
  data += "&metadata=" + encodedMetadata;
  
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
