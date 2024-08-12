FROM mhart/alpine-node

COPY docker/* .

EXPOSE 1511

CMD [ "npm", "start" ]