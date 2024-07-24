FROM node:18-alpine

WORKDIR /app/src
COPY . .
RUN yarn install
RUN apk add --no-cache bash
RUN scripts/compile
RUN cp -r node_modules/* target/node_modules/

WORKDIR /app
RUN mv src/target/* .
RUN rm -r src
RUN mkdir log

VOLUME /app/etc
VOLUME /app/log

# Settings, look into .env file for details

ENV PORT 8101
ENV TRUST_PROXY false
ENV DATABASE postgres://username:password@example.com:5432/db_name?characterEncoding=UTF-8
ENV GOOGLE_APPLICATION_CREDENTIALS /app/etc/moera-client-android-firebase-account.json
ENV LOG_DIR /app/log/
ENV LOG_LEVEL info
ENV NAMING_SERVER https://naming.moera.org/moera-naming

EXPOSE ${PORT}

CMD [ "node", "index" ]
