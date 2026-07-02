FROM node:20-alpine

WORKDIR /docs

COPY package.json ./
RUN npm install

COPY . .

RUN addgroup -S app && adduser -S app -G app && chown -R app:app /docs

EXPOSE 4000
USER app
CMD ["npm", "run", "start:docker"]
