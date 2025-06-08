FROM timbru31/node-alpine-git AS build
WORKDIR /usr/app
RUN npm install -g ts-node devtools
COPY . ./
RUN npm install \
&& npm run build \
&& npm run build:backend \
&& npm run build:web \
&& rm -rf /usr/local/lib/node_modules

FROM timbru31/node-alpine-git
WORKDIR /
COPY --from=build /usr/app/docker/* .
COPY --from=build /usr/app/docker/web ./web
EXPOSE 1511 3000-3050
CMD [ "npm", "start" ]
