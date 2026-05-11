FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
# Necesario para que Vite acepte conexiones externas en Docker
CMD ["npm", "run", "dev", "--", "--host"]
