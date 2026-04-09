FROM python:3.10-slim

WORKDIR /app

# Install Node.js for building frontend
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy and build frontend
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Expose port and start FastAPI
EXPOSE 10000
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "10000"]
