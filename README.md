# STM32 Environmental Monitoring System

This project implements an environmental monitoring system using the STM32 B-L4S5I-IOT01A development board. The system collects data from multiple sensors including light intensity, sound levels, humidity, and temperature, then transmits this data to ThingSpeak for visualization and analysis.

![DHT11 Sensor Module](https://pplx-res.cloudinary.com/image/private/user_uploads/KyQlqYAWeWVhtBW/image.jpg)

## Features

- Light intensity monitoring using **BH1750** sensor  
- Sound level detection using **MAX4466** microphone  
- Humidity measurement using **HTU2X** humidity sensor  
- Temperature measurement with **DHT11** sensor  
- Real-time data visualization via **ThingSpeak**  
- Environmental condition descriptions based on sensor readings  

## Hardware Requirements

- STM32 B-L4S5I-IOT01A development board  
- BH1750 light intensity sensor (I2C)  
- MAX4466 electret microphone amplifier  
- DHT11 temperature sensor module  
- HTU2X humidity sensor  
- Jumper wires  
- Breadboard  
- Micro USB cable for power and programming  

## Pin Connections

| Sensor  | Pin Name     | STM32 Pin         | Description                                 |
|---------|--------------|-------------------|---------------------------------------------|
| BH1750  | SCL, SDA, AD0| PB8, PB9, GND     | I2C communication (default I2C pins)        |
| MAX4466 | OUT          | PA0               | Analog input for sound level                |
| DHT11   | DAT          | PA1               | Digital input for temperature & humidity    |

> **Note:**  
> The DHT11 sensor module has three pins: VCC, DAT, and GND.  
> - VCC → 3.3V or 5V on STM32  
> - DAT → PA1 on STM32  
> - GND → GND on STM32  
> No external pull-up resistor is required for the DHT11 module.

## Library Dependencies

- Arduino Core for STM32: Base framework for STM32 boards  
- Wire.h: For I2C communication with sensors  
- WiFiST.h: STM32-specific WiFi library  
- SPI.h: Required for WiFi module communication  
- ArduinoHttpClient: For sending HTTP requests to ThingSpeak  
- RunningMedian: For noise filtering (by Rob Tillaart)  
- DHT.h: For DHT11 temperature and humidity sensor  
- Adafruit_HTU21DF: For HTU2X humidity sensor  

## Alternative Libraries

- For BH1750, alternatives include **BH1750FVI** by PeterEmbedded or **hp_BH1750** libraries  
- Instead of ArduinoHttpClient, you could use direct TCP socket programming with the **WiFiClient** class  
- For noise filtering, alternatives to **RunningMedian** include implementing your own simple averaging or using **SimpleKalmanFilter**  

## Setup Instructions

### Hardware Setup

1. Connect BH1750 to the I2C bus (SCL(PB8) and SDA(PB9) pins)  
2. Connect the MAX4466 microphone output to PA0  
3. Connect the DHT11 DAT pin to PA1, VCC to 3.3V/5V, and GND to GND  
4. Power all sensors appropriately (3.3V for VCC, GND for ground)  

### Software Setup

1. Install Arduino IDE and STM32 board support  
   - In Arduino IDE: File > Preferences > Additional Boards Manager URLs:  
     `https://github.com/stm32duino/BoardManagerFiles/raw/main/package_stmicroelectronics_index.json`

2. Install required libraries through the Arduino Library Manager:  
   - Arduino Core for STM32  
   - Arduino HTTP Client  
   - RunningMedian  
   - DHT sensor library by Adafruit (for DHT11)  
   - Adafruit_HTU21DF for Humidity sensor  
   - Wire  

3. Create a `secrets.h` file with your Wi-Fi and ThingSpeak credentials:

```C
// WiFi credentials
#define ssid "YOUR_WIFI_SSID"
#define password "YOUR_WIFI_PASSWORD"

// ThingSpeak information
#define thingSpeakHost "api.thingspeak.com"
#define thingSpeakPort 80
#define writeAPIKey "YOUR_THINGSPEAK_API_KEY"
```


4. Upload the code to your STM32 board

## ThingSpeak Setup

1. Create a free ThingSpeak account at [thingspeak.com](https://thingspeak.com)  
2. Create a new channel with the following fields:  
- Field 1: Light Intensity (lux)  
- Field 2: Sound Level (0-100)  
- Field 3: Humidity (%)  
- Field 4: Temperature (°C)  
3. Copy your Write API Key to the `secrets.h` file  

## Troubleshooting

**Common Issues**

- I2C Device Not Found: Run the I2C scanner in the code to determine the correct address  
- WiFi Connection Failure: Check credentials and ensure the board is within range  
- Sensor Reading Errors: Verify connections and power supply  
- ThingSpeak Upload Failures: Check API key and internet connectivity  

**Serial Monitor**  
The system outputs detailed information to the Serial Monitor (115200 baud), including:  
- I2C device scan results  
- Sensor readings and descriptions  
- WiFi connection status  
- ThingSpeak upload status and responses  

## Extending the Project

- Add additional sensors (air quality, pressure, etc.)  
- Implement local data storage using SD card  
- Create a custom web interface instead of ThingSpeak  
- Add alerts for abnormal environmental conditions  
- Implement power-saving modes for battery operation  

## License

This project is released under the MIT License. See the LICENSE file for details.

## Acknowledgments

- STMicroelectronics for the B-L4S5I-IOT01A development board  
- Library authors for their contributions  
- ThingSpeak for the IoT data platform  

**Author:**  
Praneeth G

**Version History**  
- v1.0 (2025-04-29): Initial release
