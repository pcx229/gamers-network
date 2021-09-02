FROM node:14-alpine

# Create app directory
WORKDIR /usr/src/app

# environment variables
ENV PORT=80

# required for build
ARG APP_BUILD_SERVER_URL
ARG APP_BUILD_CLIENT_URL

ENV REACT_APP_SERVER_URL=$APP_BUILD_SERVER_URL
ENV REACT_APP_CLIENT_URL=$APP_BUILD_CLIENT_URL

ENV SERVER_URL=$APP_BUILD_SERVER_URL
ENV CLIENT_URL=$APP_BUILD_CLIENT_URL

ENV DB_CONNECTION_STRING=
#ENV DB_NAME=gamers_social_media
#ENV DB_HOST=mongodb:/0.0.0.0:27017
#ENV DB_USER=
#ENV DB_PASSWORD=

ENV SMTP_EXIST=false
#ENV SMTP_SERVER=0.0.0.0
#ENV SMTP_PORT=25

#ENV SESSION_SECRET=32eyh392eyd89539deuq2doy3u298yd938r

ENV NODE_ENV=production

# server

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ./server/package*.json ./

# Building dependencies for production
RUN npm ci --only=production

# Bundle app source
COPY ./server/ .

# remove enviorment variables
RUN rm .env

# client

# Move to temp directory to build client app
WORKDIR temp

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ./client/package*.json ./

# Building dependencies for production
RUN npm ci --only=production

# Bundle app source
COPY ./client/ .

# remove enviorment variables
RUN rm .env

# build app for production
RUN npm run build

# Move client build to server public directory
RUN mkdir -p ../public
RUN cp -r build/* ../public

# Move back to app directory
WORKDIR ..

# Remove client development folder
RUN rm -r temp

EXPOSE 80
CMD [ "node", "app.js" ]
