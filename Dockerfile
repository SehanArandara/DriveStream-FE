FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Accept build args
ARG VITE_API_URL
ARG VITE_GOOGLE_CLIENT_ID

# Set as env vars for Vite build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]