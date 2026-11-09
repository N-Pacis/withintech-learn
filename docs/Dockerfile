FROM node:20-alpine

WORKDIR /docs
RUN addgroup -S app && adduser -S app -G app && chown app:app /docs
USER app

# Install only the mint CLI, pinned. The floating ^4 range in package.json
# changed CLI flags under us, and its "node" devDependency would download a
# second Node binary we don't need. Bump this deliberately.
RUN npm init -y >/dev/null \
 && npm install --no-audit --no-fund mint@4.3.9 \
 && npm cache clean --force

# The real package.json (start:docker script) and content replace the stub.
COPY --chown=app:app . .

EXPOSE 4000
CMD ["npm", "run", "start:docker"]
