let device;
let server;
let characteristic;
let isConnected = false;

// Funktion zur Verbindung mit dem Bluetooth-Gerät
async function connectToDevice() {
  try {
    const options = {
      acceptAllDevices: true,
      optionalServices: [
        '00001800-0000-1000-8000-00805f9b34fb', // Generic Access
        '0000180a-0000-1000-8000-00805f9b34fb'  // Device Information Service
      ]
    };

    device = await navigator.bluetooth.requestDevice(options);
    console.log("Gerät gefunden:", device.name);

    // GATT-Server-Verbindung herstellen
    server = await device.gatt.connect();
    console.log("Verbunden mit dem GATT-Server");

    // Versuche, den Device Information Service zu erhalten
    const service = await server.getPrimaryService('0000180a-0000-1000-8000-00805f9b34fb');
    
    // Überprüfe, ob die service-Variable existiert
    if (service) {
      console.log("Device Information Service gefunden");

      // Beispielcharakteristik abrufen (z. B. "Serial Number String", falls verfügbar)
      try {
        characteristic = await service.getCharacteristic('2a25'); // 2A25 ist oft die UUID für die Seriennummer
        console.log("Charakteristik gefunden: Serial Number String");
        await characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', handleData);
        alert("Verbindung hergestellt! OBD-Nachrichten können jetzt gesendet werden.");
        isConnected = true;
      } catch (error) {
        console.error("Fehler beim Abrufen der Charakteristik:", error);
      }
    } else {
      console.error("Device Information Service nicht gefunden.");
    }
  } catch (error) {
    console.error("Fehler:", error);
    alert("Bluetooth-Verbindung konnte nicht hergestellt werden.");
    isConnected = false;
  }
}

// Funktion zur Verarbeitung empfangener Daten
function handleData(event) {
  if (!isConnected) return;
  const value = new TextDecoder().decode(event.target.value);
  console.log("Empfangene Daten:", value);
  addMessageToChat(value, 'device');
}

// Hilfsfunktionen zum Testen und Debuggen
function addMessageToChat(message, sender) {
  const messages = document.getElementById('messages');
  const messageElem = document.createElement('div');
  messageElem.className = `message ${sender}`;
  messageElem.textContent = message;
  messages.appendChild(messageElem);
  messages.scrollTop = messages.scrollHeight;
}
