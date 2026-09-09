FROM node

ENV MONGO_DB_USERNAME=sachin_admin \
    MONGO_DB_PWD=secret

RUN mkdir -p delta/nodeapp

COPY . /delta/nodeapp

CMD ["node", "/delta/nodeapp/server.js"]