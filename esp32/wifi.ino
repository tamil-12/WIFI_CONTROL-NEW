#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>

const char* ssid = "ESP32-Access-Point";
const char* password = "password";

WebServer server(80);

const int LED_PIN = 2; // Assuming the onboard LED is connected to GPIO pin 2

void setup() {
  Serial.begin(115200);

  // Set up the access point
  WiFi.softAP(ssid, password);
  IPAddress IP = WiFi.softAPIP();
  Serial.print("AP IP address: ");  
  Serial.println(IP);

  // Initialize LED pin as output
  pinMode(LED_PIN, OUTPUT);

  server.on("/", HTTP_GET, [](){
    server.send(200, "text/plain", "Hello from ESP32 Access Point!");
  });

  server.on("/send-data", HTTP_POST, [](){
    // Parse JSON data from the received message
    StaticJsonDocument<200> jsonBuffer;
    DeserializationError error = deserializeJson(jsonBuffer, server.arg("plain"));
    
    // Check for parsing errors
    if (error) {
      Serial.print("Error parsing JSON: ");
      Serial.println(error.c_str());
      server.send(400, "text/plain", "Error parsing JSON");
      return;
    }
    
    // Extract the value associated with the "action" key
    const char* action = jsonBuffer["action"];
   String data = server.arg("plain");
    Serial.print("Received data: ");
    Serial.println(data);
    // Check if the action is "on", then turn on the LED
    if (strcmp(action, "on") == 0) {
      digitalWrite(LED_PIN, HIGH);
      Serial.println("LED turned on");
    }
if (strcmp(action, "off") == 0) {
      digitalWrite(LED_PIN, LOW);
      Serial.println("LED turned off");
    }
    server.send(200, "text/plain", "Data received by ESP32");
  });

  server.begin();
  Serial.println("HTTP server started");
}

void loop() {
  server.handleClient();
}
