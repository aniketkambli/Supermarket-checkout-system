FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm install -g nodemon
CMD ["nodemon", "--exec", "ts-node", "src/index.ts"]