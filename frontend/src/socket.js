/**
 * Uygulama genelinde tek bir Socket.io bağlantısı.
 * Bileşenler bu dosyadan import ederek aynı soketi paylaşır;
 * her bileşen ayrı bir bağlantı açmaz.
 *
 * Kullanım:
 *   import socket from "../socket.js";
 *   socket.on("oy_guncellendi", (data) => { ... });
 *   // bileşen unmount olunca:
 *   socket.off("oy_guncellendi");
 */
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const socket = io(SOCKET_URL, {
  // İlk render'da otomatik bağlan, sekme kapanınca bağlantıyı kes.
  autoConnect: true,
  // Bağlantı kopsa yeniden dene (websocket → polling fallback).
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
});

export default socket;
