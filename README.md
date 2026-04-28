# Collaborative Real-Time Whiteboard 🎨

A lightweight, high-performance web application for real-time collaborative drawing. Built to demonstrate distributed systems logic, WebSocket synchronization, and frontend canvas rendering.

## 🚀 Key Features

* **Real-Time Synchronization:** Multi-user drawing with minimal latency using WebSockets.
* **State Persistence (Replay):** New users automatically receive the current board state upon joining.
* **Conflict Resolution:** Unique stroke ID tracking to prevent duplicate rendering.
* **Modern Stack:** Built with modern tools including Spring Boot, React, and Vite.

## 🛠 Tech Stack

* **Frontend:** React, TypeScript, Vite, HTML5 Canvas 
* **Backend:** Java 21, Spring Boot, Spring WebSockets
* **Deployment:** Docker & Docker Compose

## 📈 System Architecture

The system uses a **Star Topology** where the Spring Boot server acts as a central broker. 

1. **Client A** finishes a stroke -> Emits a WebSocket event with the stroke payload.
2. **Server (Spring Boot)** intercepts the action via `DrawHandler`, validates it, updates the in-memory board state, and broadcasts the event to all other connected clients.
3. **Client B** receives the broadcast event over its WebSocket connection and updates the local canvas.

## 🔧 Installation & Setup

We recommend using Docker for the easiest setup experience, but you can also run the system manually.

### Option 1: Using Docker (Recommended)

Make sure you have [Docker](https://www.docker.com/) and Docker Compose installed.

1. **Run the services:**
   ```bash
   docker-compose up --build
   ```
2. **Access the Application:**
   - Frontend is available at: `http://localhost:3000`
   - Backend WebSocket server runs on: `ws://localhost:8080/ws`

### Option 2: Manual Setup

**Requirements:**
- Java 21+
- Node.js 18+

#### 1. Backend Setup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Build and run the Spring Boot application using the Maven Wrapper:
   ```bash
   # On Windows:
   ./mvnw.cmd spring-boot:run
   
   # On Mac/Linux:
   ./mvnw spring-boot:run
   ```
   The backend will start on port `8080`.

#### 2. Frontend Setup

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *Note: Vite typically runs the dev server on `http://localhost:5173`. Check the terminal output for the exact URL.*

## 📖 How to Use

1. **Join the Board:** Open the frontend URL in multiple browser windows or different devices on the same network.
2. **Draw:** Click and drag on the canvas to draw. 
3. **Collaborate:** You'll see real-time updates as other connected users draw on their respective canvases. Newly connected users will automatically receive existing drawings.
