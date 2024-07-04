FROM node:latest

ENV dir=/home/ploebl/private-dev/sandbox

RUN mkdir -p $dir/node_modules && chown -R node:node $dir

WORKDIR $dir

COPY --chown=node:node package*.json ./

USER node

RUN npm install

COPY --chown=node:node . .

EXPOSE 3002

CMD [ "node", "index.js" ]
