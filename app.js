let device;
let server;
let characteristic;
let isConnected = false;

async function connectToDevice() {
  try {
    const options = {
      acceptAllDevices: true,
      optionalServices: ['0000fff0-0000-1000-8000-00805f9b34fb']
    };

    device = await navigator.bluetooth.requestDevice(options);
    console.log("Gerät gefunden:", device.name);

    server = await device.gatt.connect();
    const service = await server.getPrimaryService('0000fff0-0000-1000-8000-00805f9b34fb');
    
    // Versuche Zugriff auf FFF1-Charakteristik
    try {
      characteristic = await service.getCharacteristic('0000fff1-0000-1000-8000-00805f9b34fb');
      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', handleData);

      alert("Verbindung hergestellt! Nachrichten können jetzt gesendet werden.");
      isConnected = true;
    } catch (error) {
      console.error("Fehler bei Zugriff auf FFF1:", error);
    }
  } catch (error) {
    console.error("Verbindungsfehler:", error);
  }
}

function handleData(event) {
  const value = new TextDecoder().decode(event.target.value);
  console.log("Empfangene Daten:", value);
}

// Senden von Daten
async function sendMessage(message) {
  if (isConnected) {
    const encoder = new TextEncoder();
    await characteristic.writeValue(encoder.encode(message + '\r'));
  }
}
