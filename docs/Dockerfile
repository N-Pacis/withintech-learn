FROM node:20-alpine

WORKDIR /docs

COPY package.json ./
RUN npm install

COPY . .

EXPOSE 4000
CMD ["npm", "run", "start:docker"]
