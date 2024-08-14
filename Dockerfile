FROM mhart/alpine-node

COPY docker/* .

EXPOSE 1512

CMD [ "npm", "start" ]