let device;
let server;
let characteristic;

// Funktion, um die Bluetooth-Verbindung herzustellen
async function connectToOBDII() {
  try {
    console.log("Suche nach Bluetooth-Geräten gestartet...");
    // Suche nach Bluetooth-Geräten
    device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ['battery_service'] // Ersetze 'battery_service' durch die tatsächliche Service-UUID
    });

    console.log("Gerät gefunden:", device.name);
    server = await device.gatt.connect();
    console.log("Bluetooth-Gerät verbunden:", device);

    // Verbinde mit dem spezifischen Service und der Charakteristik
    const service = await server.getPrimaryService('battery_service'); // Ersetze mit der tatsächlichen Service-UUID
    characteristic = await service.getCharacteristic('battery_level'); // Ersetze mit der tatsächlichen Charakteristik-UUID

    // Empfang von Nachrichten aktivieren
    await characteristic.startNotifications();
    characteristic.addEventListener('characteristicvaluechanged', handleIncomingMessage);
    alert("Verbindung hergestellt! Du kannst jetzt Nachrichten senden.");
  } catch (error) {
    console.error("Verbindung fehlgeschlagen:", error);
    alert("Verbindung zum Gerät fehlgeschlagen: " + error);
  }
}

// Funktion zur Verarbeitung eingehender Nachrichten
function handleIncomingMessage(event) {
  const decoder = new TextDecoder();
  const response = decoder.decode(event.target.value);
  console.log("Nachricht erhalten:", response);
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
  const input = document.getElementById('inputMessage');
  const message = input.value;
  input.value = '';  // Leert das Eingabefeld

  addMessageToChat(message, 'user');  // Zeigt die Nachricht im Chat an

  const encoder = new TextEncoder();
  await characteristic.writeValue(encoder.encode(message + '\r'));  // Nachricht an Gerät senden
}

// Bluetooth-Verbindung beim Laden der Seite herstellen
document.addEventListener('DOMContentLoaded', () => {
  console.log("Bereit für Bluetooth-Verbindung.");
});
