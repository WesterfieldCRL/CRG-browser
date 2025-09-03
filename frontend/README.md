To run the frontend, please run the following commands in the frontend directory

npm run build
docker biild -t nextjs-docker .
docker run -p 3000:3000 nextjs-docker