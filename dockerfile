# build vue web
FROM node:12.16-alpine
ENV BUILD_SRC=/src/
RUN mkdir -p ${BUILD_SRC}
COPY . ${BUILD_SRC}
WORKDIR ${BUILD_SRC}
RUN npm install
CMD ["node","server.js"]
