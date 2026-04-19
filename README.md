# Collaborative Real-Time Whiteboard 🎨

A lightweight, high-performance web application for real-time collaborative drawing. Built in 7 days as a demonstration of distributed systems logic, WebSocket synchronization, and frontend canvas rendering.

## 🚀 Key Features

* **Real-Time Synchronization:** Multi-user drawing with minimal latency using Socket.IO.
* **State Persistence (Replay):** New users automatically receive the current board state upon joining.
* **Conflict Resolution:** Unique stroke ID tracking to prevent duplicate rendering.
* **Network Simulation:** Built-in delay simulation to test system stability under poor network conditions.
* **Room Support:** Isolated drawing sessions for different groups of users.

## 🛠 Tech Stack

* **Frontend:** React, TypeScript, HTML5 Canvas / Konva.js
* **Backend:** Node.js, Express
* **Real-time:** Socket.IO (WebSockets)
* **State Management:** Client-side stroke buffering and server-side in-memory storage.

## 👥 Team Roles

* **Frontend (Canvas):** Local drawing logic and rendering engine.
* **Frontend (Integration):** WebSocket client implementation and event handling.
* **Backend:** Node.js server architecture and broadcast logic.
* **Data & Sync:** Synchronization algorithms, duplicate prevention, and state replay.
* **QA & Docs:** Quality assurance, network stress testing, and documentation.

## 📈 System Architecture

The system uses a **Star Topology** where the Node.js server acts as a central broker. 

1. **Client A** finishes a stroke -> Emits `stroke` event.
2. **Server** validates the stroke ID, stores it in the `strokes` array, and broadcasts it to all other connected clients.
3. **Client B** receives the event and invokes the `drawStroke()` function to update the local canvas.



## 🔧 Installation & Setup

1. Clone the repository: `git clone [repo-url]`
2. Install dependencies for both client and server: `npm install`
3. Run the server: `npm run server`
4. Run the client: `npm start`
