FROM node:16.20.2

EXPOSE 3000
ENV NODE_ENV=production
CMD ["yarn", "start"]

WORKDIR /app
ADD package.json yarn.lock /app/
RUN yarn --pure-lockfile
ADD . /app
