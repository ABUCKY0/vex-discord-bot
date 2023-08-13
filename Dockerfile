FROM node:7 
COPY package.json  
COPY yarn.lock 
RUN yarn install 
RUN yarn build
COPY . /app 
CMD yarn start
EXPOSE 8000
