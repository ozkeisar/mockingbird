FROM timbru31/node-alpine-git

COPY docker/* .

EXPOSE 1512 3000-3050

CMD [ "npm", "start" ]