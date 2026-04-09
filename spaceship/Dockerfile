# Use a modern lightweight Python image
FROM python:3.11-slim

# Set the working directory
WORKDIR /app

# Copy requirement files first for docker caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose port 5000 for the Flask server
EXPOSE 5000

# Run the app using Gunicorn and Eventlet for web sockets
CMD ["gunicorn", "--worker-class", "eventlet", "-w", "1", "-b", "0.0.0.0:5000", "app:app"]