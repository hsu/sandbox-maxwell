# Galactic Showdown

A real-time multiplayer 2D spaceship shooter game built with Python, Flask, and WebSockets (`Flask-SocketIO`).

## Features
- Choose from 3 ship classes: Fighter, Scout, and Juggernaut
- Join either the Red Vanguard or Blue Syndicate factions
- Battle mechanics including dynamic space obstacles, weapons tracking, and in-game upgrade shop
- Global and Team-based real-time radio chat

## How to Run locally

The easiest way to run the application is by using Docker.

### 1. Build the Docker Image

From the project root directory, build the container image:
```bash
docker build -t spaceship-game .
```

### 2. Start the Server

Run the container, exposing the Flask port to your machine. For security alongside a reverse proxy, it is recommended to bind it only to localhost:
```bash
docker run -p 127.0.0.1:5000:5000 spaceship-game
```

The server will start up using Gunicorn with Eventlet to handle WebSockets. You can access the game at:
[http://localhost:5000/spaceship](http://localhost:5000/spaceship)

> **Authentication Passcode:** `spaceship123`

## Reverse Proxy Setup for Production

This app is explicitly configured to gracefully run natively under the `/spaceship` routing path. When deploying this in a production setting through a reverse proxy (like Apache or Nginx):

- Proxy the `/spaceship` context to internal port `5000`.
- Ensure standard WebSockets connection upgrade (`Upgrade: websocket`) works correctly on the proxy to prevent falling back to HTTP long polling.

You can find the reference `Apache2` VirtualHost files pre-configured inside the `deploy/` directory of this repository!
