# codbex-agoreus-platform

The `codbex` `agoreus` platform package

To build the docker image:

    docker build -t codbex-agoreus-platform:latest .

To run a container:

    docker run --name agoreus --rm -p 8080:8080 -p 8081:8081 codbex-agoreus-platform:latest
    
To stop the container:

    docker stop agoreus

To tag the image:

    docker tag codbex-agoreus-platform codbex.jfrog.io/codbex-docker/codbex-agoreus-platform:latest

To push to JFrog Container Registry:

    docker push codbex.jfrog.io/codbex-docker/codbex-agoreus-platform:latest

To pull from JFrog Container Registry:

    docker pull codbex.jfrog.io/codbex-docker/codbex-agoreus-platform:latest
