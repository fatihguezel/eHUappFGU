let device;
let server;
let characteristic;
let isConnected = false; // Verbindungsstatus-Flag

// Funktion zur Bluetooth-Verbindung mit OBDII-Gerät
async function connectToOBDII() {
  try {
    const options = {
      filters: [{
        services: ['battery_service'], // Ersetze mit der tatsächlichen Service-UUID deines OBDII-Geräts
        namePrefix: 'OBD' // Optional: Filtert Geräte, deren Namen mit "OBD" beginnen
      }],
      optionalServices: ['device_information'] // Zusätzliche Services, falls erforderlich
    };

    console.log("Suche nach Bluetooth-Geräten mit den angegebenen Filtern...");
    device = await navigator.bluetooth.requestDevice(options);
    console.log("Gerät gefunden:", device.name);

    // Verbindung zum GATT-Server des Geräts herstellen
    server = await device.gatt.connect();
    console.log("Bluetooth-Gerät verbunden:", device);

    // Zugriff auf spezifische Services und Charakteristiken
    const service = await server.getPrimaryService('battery_service'); // Ersetze mit der Service-UUID des Geräts
    characteristic = await service.getCharacteristic('battery_level'); // Ersetze mit der Charakteristik-UUID

    // Aktivierung von Benachrichtigungen für eingehende Nachrichten
    await characteristic.startNotifications();
    characteristic.addEventListener('characteristicvaluechanged', handleIncomingMessage);
    alert("Verbindung hergestellt! Du kannst jetzt Nachrichten senden.");

    isConnected = true; // Verbindung erfolgreich hergestellt
  } catch (error) {
    console.error("Verbindung fehlgeschlagen:", error);
    alert("Verbindung zum Gerät fehlgeschlagen.");
    isConnected = false;
  }
}

// Funktion zur Verarbeitung eingehender Nachrichten
function handleIncomingMessage(event) {
  if (!isConnected) return; // Nachrichten nur verarbeiten, wenn verbunden
  const decoder = new TextDecoder();
  const response = decoder.decode(event.target.value);
  console.log("Nachricht vom Gerät empfangen:", response);
  addMessageToChat(response, 'device');
}

// Funktion zum Hinzufügen einer Nachricht zum Chat
function addMessageToChat(message, sender) {
  const messages = document.getElementById('messages');
  const messageElem = document.createElement('div');
  messageElem.className = `message ${sender}`;
  messageElem.textContent = message;
  messages.appendChild(messageElem);
  messages.scrollTop = messages.scrollHeight;
}

// Funktion zum Senden einer Nachricht an das Bluetooth-Gerät
async function sendMessage() {
  if (!isConnected) {
    alert("Bitte zuerst eine Bluetooth-Verbindung herstellen.");
    return;
  }

  const input = document.getElementById('inputMessage');
  const message = input.value;
  input.value = '';  // Leert das Eingabefeld

  addMessageToChat(message, 'user');  // Zeigt die Nachricht im Chat an

  const encoder = new TextEncoder();
  await characteristic.writeValue(encoder.encode(message + '\r'));  // Nachricht an das Gerät senden
}

// Bluetooth-Verbindung beim Laden der Seite bereitstellen
document.addEventListener('DOMContentLoaded', () => {
  console.log("Bereit für die Bluetooth-Verbindung.");
});
