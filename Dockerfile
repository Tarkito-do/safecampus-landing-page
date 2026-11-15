FROM node:22-alpine
WORKDIR /app
COPY . .
ENV PORT=3000 HOST=0.0.0.0 SAFECAMPUS_DATA=/data
RUN mkdir -p /data
EXPOSE 3000
VOLUME ["/data"]
CMD ["npm","start"]
