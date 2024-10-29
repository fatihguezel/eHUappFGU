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
        '000018f0-0000-1000-8000-00805f9b34fb', // Daten-Service UUID
        '00001800-0000-1000-8000-00805f9b34fb'  // GATT-Profil UUID
      ]
    };

    device = await navigator.bluetooth.requestDevice(options);
    console.log("Gerät gefunden:", device.name);

    // GATT-Server-Verbindung herstellen
    server = await device.gatt.connect();
    console.log("Verbunden mit dem GATT-Server");

    // Service und Charakteristik abrufen
    const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
    characteristic = await service.getCharacteristic('battery_level'); // Passe die UUID für die Charakteristik an

    await characteristic.startNotifications();
    characteristic.addEventListener('characteristicvaluechanged', handleData);
    alert("Verbindung hergestellt! Nachrichten können jetzt gesendet werden.");
    isConnected = true;
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

// Funktion zum Senden einer Nachricht
async function sendMessage() {
  if (!isConnected) {
    alert("Bitte zuerst eine Verbindung herstellen.");
    return;
  }

  const input = document.getElementById('inputMessage');
  const message = input.value;
  input.value = '';

  addMessageToChat(message, 'user');

  const encoder = new TextEncoder();
  await characteristic.writeValue(encoder.encode(message + '\r'));
}

// Funktion zur Anzeige von Nachrichten im Chat
function addMessageToChat(message, sender) {
  const messages = document.getElementById('messages');
  const messageElem = document.createElement('div');
  messageElem.className = `message ${sender}`;
  messageElem.textContent = message;
  messages.appendChild(messageElem);
  messages.scrollTop = messages.scrollHeight;
}
