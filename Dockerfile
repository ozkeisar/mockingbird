FROM timbru31/node-alpine-git

COPY docker/* .
COPY docker/web ./web

EXPOSE 1511 3000-3050

CMD [ "npm", "start" ]