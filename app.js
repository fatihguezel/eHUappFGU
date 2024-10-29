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
        '0000fff0-0000-1000-8000-00805f9b34fb'  // Custom Service für OBD-Kommunikation
      ]
    };

    device = await navigator.bluetooth.requestDevice(options);
    console.log("Gerät gefunden:", device.name);

    // GATT-Server-Verbindung herstellen
    server = await device.gatt.connect();
    console.log("Verbunden mit dem GATT-Server");

    // Zugriff auf den Service `fff0`
    const service = await server.getPrimaryService('0000fff0-0000-1000-8000-00805f9b34fb');
    
    // Zugriff auf die Charakteristik `fff1`
    try {
      characteristic = await service.getCharacteristic('0000fff1-0000-1000-8000-00805f9b34fb');
      console.log("Charakteristik fff1 gefunden und für Benachrichtigungen aktiviert");

      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', handleData);

      alert("Verbindung hergestellt! OBD-Nachrichten können jetzt gesendet werden.");
      isConnected = true;
    } catch (error) {
      console.error("Charakteristik fff1 nicht gefunden, versuche ae3b:", error);

      // Wenn `fff1` nicht gefunden wurde, versuche `ae3b`
      try {
        characteristic = await service.getCharacteristic('0000ae3b-0000-1000-8000-00805f9b34fb');
        console.log("Charakteristik ae3b gefunden und für Benachrichtigungen aktiviert");

        await characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', handleData);

        alert("Verbindung hergestellt! OBD-Nachrichten können jetzt gesendet werden.");
        isConnected = true;
      } catch (error) {
        console.error("Keine passende Charakteristik gefunden:", error);
        alert("OBD-Dongle unterstützt keine kompatible Kommunikationscharakteristik.");
      }
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

// Funktion zum Senden einer Nachricht (OBD-Befehl)
async function sendMessage() { 
  if (!isConnected) {
    alert("Bitte zuerst eine Verbindung herstellen.");
    return;
  }

  const input = document.getElementById('inputMessage');
  const obdCommand = input.value;
  input.value = '';

  addMessageToChat(obdCommand, 'user');

  const encoder = new TextEncoder();
  await characteristic.writeValue(encoder.encode(obdCommand + '\r'));
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
