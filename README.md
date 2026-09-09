# Docker — Complete Notes

A structured guide covering Docker fundamentals, images vs containers, networking, volumes, Docker Compose, and dockerizing a real Node.js + MongoDB application — from first principles to publishing an image on Docker Hub.

---

## Table of Contents

1. [Why Do We Need Docker?](#why-do-we-need-docker)
2. [Docker Container](#docker-container)
3. [Docker Image](#docker-image)
4. [Docker vs Virtual Machine](#docker-vs-virtual-machine)
5. [Docker on macOS/Windows (Docker Desktop)](#but-docker-was-mainly-linux-focused)
6. [Docker Image vs Container (Layers)](#docker-image-vs-container)
7. [Pulling Images from Docker Hub](#pulling-images-from-docker-hub)
8. [Removing Images & Containers](#removing-images--containers)
9. [Running a Container](#running-a-container)
10. [Port Binding](#port-binding)
11. [Troubleshooting Commands](#docker--troubleshooting-commands)
12. [Use Case: Developing with Docker (Node + MongoDB + Mongo Express)](#use-case-developing-with-docker)
13. [Docker Compose](#docker-compose)
14. [Use Case: Dockerizing Our App](#use-case-dockerizing-our-app)
15. [Dockerfile Instructions](#dockerfile-instructions)
16. [Creating a Dockerfile & Building Our Node.js Image](#creating-a-dockerfile--building-our-nodejs-image)
17. [Publishing a Docker Image on Docker Hub](#publish-docker-image-on-docker-hub)
18. [Docker Volumes](#docker-volumes)
19. [Docker Network](#docker-network)

---

## Why Do We Need Docker?

### The Problem: "It Works on My Machine!"

Imagine we build an application on **Computer A (Linux)**. Our application depends on specific versions of:

```
Application
   ↓
Node.js v16
MongoDB v4.2
Other dependencies
```

Everything works perfectly on our computer.

Now, we give the same application to a new developer using **macOS**. Their machine might have:

- Node.js v20
- MongoDB v6
- A different OS
- Different system configuration

They install the application and try to run it — **it may not work**.

### Why Does This Happen?

Because an application doesn't depend only on our source code. It can also depend on:

- Operating system
- Node.js version
- Database version
- Package/dependency versions
- Environment variables
- System libraries
- Configuration

### The Real-World Problem

Without Docker, a new developer might have to manually install:

1. Correct Node.js version
2. Correct MongoDB version
3. Correct dependencies
4. Correct configurations
5. Correct environment variables
6. Correct system requirements

And even after doing all this, something might still be different. That's where we get the famous developer complaint:

> **"But it works on my machine!"**

---

## Docker Container

A **Docker Container** is a simple, isolated unit in which we package and run our application + required dependencies/environment together.

For example:

```
Application
+ Node.js v16
+ Dependencies
+ Required libraries/config
        ↓
   Docker Container
```

So instead of sending the application and telling another developer _"Install Node v16, this dependency, this version, configure this..."_, we can provide the **Docker image**, from which they can create the same container environment.

### Main Benefits

| Benefit                | Description                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------ |
| **Portable**           | The same image/container setup can run through Docker on Linux, macOS, Windows, etc. |
| **Lightweight**        | Much lighter than a full Virtual Machine.                                            |
| **Consistent**         | Reduces the "It works on my machine!" problem.                                       |
| **Different versions** | Different applications can use different versions of the same technology.            |

---

## Docker Image

A **Docker Image** is a read-only blueprint/template used to create containers.

### Easy Analogy

```
Class  → Objects
Image  → Containers
```

Just like a class defines how objects are created:

```
                     Image
                  /    |    \
                 ↓     ↓     ↓
         Container Container Container
```

One image can create **multiple containers**. Think of an image as a static snapshot/template of the application and its required environment.

> **Important:** We normally share/publish the Docker **Image**, not the running container.

---

## Docker vs Virtual Machine

Both Docker Containers and Virtual Machines (VMs) provide isolated environments, but they work differently.

### Docker / Container

Docker containers **share the host OS kernel** and mainly isolate the application + required dependencies.

```
Host OS Kernel
      ↑
   Container
      ↓
Application + Dependencies
```

- Container doesn't have its own kernel.
- It cannot directly access everything from the host OS; it runs in an isolated environment.
- Because it doesn't need a complete OS/kernel, it has less overhead.
- Therefore, Docker containers are lightweight and faster to start.

### Virtual Machine

A VM has its own **guest OS and its own kernel**.

```
Host OS
   ↓
Hypervisor
   ↓
Guest OS + Kernel
   ↓
Application
```

So a VM virtualizes a complete machine environment, including the OS.

- Has its own kernel.
- Requires a complete guest OS.
- More resources are required.
- Larger overhead compared to containers.

### Comparison Table

| Docker Container           | Virtual Machine             |
| -------------------------- | --------------------------- |
| Shares host OS kernel      | Has its own guest OS/kernel |
| Application + dependencies | Complete OS + application   |
| Lightweight                | Heavier                     |
| Less overhead              | More overhead               |
| Starts faster              | Starts slower               |

---

## But Docker was Mainly Linux-Focused

Docker containers rely on Linux kernel features, so running Linux containers directly on a non-Linux OS isn't the same as running them natively on Linux. That's where **Docker Desktop** helps.

On macOS/Windows, Docker Desktop uses a lightweight virtualization layer and runs a small Linux-based VM internally:

```
macOS / Windows
      ↓
 Docker Desktop
      ↓
Small Linux-based VM
      ↓
 Docker Engine
      ↓
 Containers
```

So even though your system isn't Linux, Docker Desktop provides the Linux environment/kernel needed to run Linux containers.

---

## Docker Image vs Container

### Docker Image

A Docker Image is a read-only template/file used to create containers.

- An image is made up of multiple **layers**.
- These layers are **read-only**.
- The bottom layer is generally a **base layer**, often based on Linux.
- Example of a lightweight Linux base image: **Alpine Linux**.

```
Docker Image
    │
    ├── Layer 3  ← Read-only
    ├── Layer 2  ← Read-only
    ├── Layer 1  ← Read-only
    └── Base Layer (Linux/Alpine) ← Read-only
```

### Docker Container

A Container is a **running instance** of a Docker Image. When a container is created, Docker adds a **writable container layer** on top of the image layers.

```
Container
    │
    └── Container Layer ← Read + Write
            │
        Layer 2 ← Read-only
            │
        Layer 1 ← Read-only
            │
        Base Layer ← Read-only
```

### Container Contains

- **Port** → Used to communicate with the application.
- **Virtual/Container Filesystem** → Provides the container's file environment.
- **Writable Layer** → Changes made while the container is running are stored here.

---

## Pulling Images from Docker Hub

Docker Hub provides ready-made Docker images. For example, we can search for the MySQL image and check its **Supported Tags** and corresponding **Dockerfile** links.

### Supported Tags

Tags represent different versions/variants of an image.

```bash
docker pull mysql
```

By default, this pulls the `latest` tag.

To pull a specific version:

```bash
docker pull mysql:8.0
```

### Docker Image Layers

Docker images are made up of multiple layers.

If we already have `mysql:8.0` and later pull `mysql:9`, some layers may be common between both versions. Docker can **reuse** the layers it already has instead of downloading them again — this saves download time and storage.

---

## Removing Images & Containers

See downloaded images:

```bash
docker images
```

Remove a container:

```bash
docker rm CONTAINER_ID
```

Remove an image:

```bash
docker rmi IMAGE_ID
```

> If an image is being used by a container, Docker may not allow you to remove it.

---

## Running a Container

```bash
docker run -d IMAGE_NAME
```

**`-d` = Detached Mode** — the container runs in the background. Without `-d`, the container normally runs in the foreground/attached mode, so your terminal remains attached to it.

### Giving a Custom Container Name

Docker automatically generates a container name if we don't provide one. To give our own name:

```bash
docker run --name CONTAINER_NAME -d IMAGE_NAME
```

Example:

```bash
docker run --name mysql-older -d mysql:8.0
```

### Environment Variables with `-e`

Some images require environment variables before they can run properly. According to the MySQL image documentation, we need to provide a root password. `-e` is used to set environment variables.

```bash
docker run -d --name mysql-latest -e MYSQL_ROOT_PASSWORD=secretpass mysql
```

For MySQL 8.0:

```bash
docker run -d --name mysql-older -e MYSQL_ROOT_PASSWORD=secretpass mysql:8.0
```

We can provide multiple environment variables using multiple `-e` options.

---

## Port Binding

When we run `docker ps`, we see a **PORTS** column.

### What is Port Binding?

Port binding means mapping a port of our host machine to a port inside the container.

```
Host Machine                            Container
    8080   ─────────────>    3306
```

This allows us to access the application's container port through the host machine's port.

**Syntax:**

```bash
docker run -p HOST_PORT:CONTAINER_PORT IMAGE_NAME
```

**Example:**

```bash
docker run -d --name mysql-latest -p 8080:3306 -e MYSQL_ROOT_PASSWORD=secretpass mysql
```

Meaning:

- `8080` → Host machine port
- `3306` → Container port

```
Host:8080
    ↓
Container:3306
```

### Important Port Rule

Multiple containers can internally use the same **container port**:

```
Container 1 → 3306
Container 2 → 3306
```

But they **cannot** use the same **host port** at the same time.

---

## Docker — Troubleshooting Commands

Sometimes a Docker container doesn't work as expected. We can use Docker commands to find out what is happening inside the container and identify the problem.

### 1. `docker logs`

Shows the logs/output of a particular container.

```bash
docker logs CONTAINER_ID
```

Useful for checking:

- Errors
- Application output
- Server messages
- Why the container may have stopped or failed

### 2. `docker exec`

If we want to enter a running container and execute commands inside it, use:

```bash
docker exec -it CONTAINER_ID /bin/bash
```

or

```bash
docker exec -it CONTAINER_ID /bin/sh
```

**What does `-it` mean?**

- `-i` → Interactive → keeps input open
- `-t` → Provides a terminal (TTY)

Together, `-it` allows us to interactively use the terminal inside that container. Once inside, we can run multiple commands, for example:

```bash
ls
pwd
cd /app
```

To leave the container's terminal:

```bash
exit
```

> `docker exec -it` → Enter a running container and run commands inside it.

---

## Use Case: Developing with Docker

Suppose we have a simple Node.js application:

```
Node Application
│
├── Frontend → index.html
│              (HTML + CSS + JS in one file)
│
├── Backend → server.js
│
└── Database → MongoDB
```

Normally, to connect MongoDB with `server.js`, we would install and set up MongoDB on our own system. But with Docker, we can run MongoDB **as a Docker Container**.

So now: we only need to write our Frontend + Backend. MongoDB can run inside a Docker container.

### 1. MongoDB Docker Image

To set up MongoDB with our Node.js application, we can use the **Mongo Docker Image** — the image used to create a container in which the actual MongoDB database runs. We can get it from Docker Hub.

We can either:

```bash
docker pull mongo
```

and then create a container, **or** directly run a container:

```bash
docker run mongo
```

### 2. Mongo Express

**Mongo Express** is a GUI/web interface for MongoDB. It allows us to visually view and manage our MongoDB database through the browser instead of working only through the terminal.

### 3. Docker Network

Before connecting MongoDB and Mongo Express, we need to understand **Docker Network**.

Docker allows us to create isolated networks for containers. If multiple containers are inside the same Docker network, they can communicate directly with each other without needing:

- Host machine
- `localhost`
- Host port binding

```
        Docker Network
   ┌─────────────────────┐
   │                     │
   │   Mongo Container   │
   │          ↕          │
   │    Mongo Express    │
   │                     │
   └─────────────────────┘
```

This is useful because we want our Mongo Container ↕ Mongo Express Container to communicate directly. So we'll put both containers inside the same Docker network.

### 4. Check Docker Networks

To see the Docker networks available on our system:

```bash
docker network ls
```

> Docker commands can be executed from any directory in the terminal. So even if we're currently inside our `nodeapp` project folder, Docker commands will work.

### 5. Create Our Own Network

To create a custom Docker network:

```bash
docker network create NETWORK_NAME
```

Example:

```bash
docker network create mongo-network
```

Now we can run our MongoDB and Mongo Express containers inside `mongo-network` so they can communicate directly.

### 6. Setup MongoDB & Mongo Express Containers

We need two containers:

| Container               | Purpose                    |
| ----------------------- | -------------------------- |
| MongoDB Container       | Actual database            |
| Mongo Express Container | GUI to view/manage MongoDB |

There are two ways to create them:

1. Pull the images first and then run containers.
2. Directly use `docker run` — Docker will pull the image automatically if it is not available locally.

We will use the second approach.

**a. Run the MongoDB container**

```bash
docker run -d \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=sachin_admin \
  -e MONGO_INITDB_ROOT_PASSWORD=sachinpass \
  --name mongo \
  --network mongo-network \
  mongo
```

| Flag                                | Meaning                                            |
| ----------------------------------- | -------------------------------------------------- |
| `-d`                                | Run in detached/background mode                    |
| `-p 27017:27017`                    | Host Port : Container Port                         |
| `-e MONGO_INITDB_ROOT_USERNAME=...` | Set MongoDB root username                          |
| `-e MONGO_INITDB_ROOT_PASSWORD=...` | Set MongoDB root password                          |
| `--name mongo`                      | Give the container a custom name                   |
| `--network mongo-network`           | Connect the container to our custom Docker network |
| `mongo`                             | Image name                                         |

**b. Run the Mongo Express container**

Mongo Express needs 3 important environment variables:

1. MongoDB username
2. MongoDB password
3. MongoDB connection URL

The username and password must be the same credentials we defined in the MongoDB container.

```bash
docker run -d \
  -p 8081:8081 \
  --network mongo-network \
  --name mongo-express \
  -e ME_CONFIG_MONGODB_ADMINUSERNAME=sachin_admin \
  -e ME_CONFIG_MONGODB_ADMINPASSWORD=sachinpass \
  -e ME_CONFIG_MONGODB_URL="mongodb://sachin_admin:sachinpass@mongo:27017" \
  mongo-express
```

- `--network mongo-network` → Connect to the same Docker network
- `ME_CONFIG_MONGODB_ADMINUSERNAME` → Same username as the MongoDB container
- `ME_CONFIG_MONGODB_ADMINPASSWORD` → Same password as the MongoDB container

**`ME_CONFIG_MONGODB_URL`** tells Mongo Express where MongoDB is running:

```
mongodb://USERNAME:PASSWORD@CONTAINER_NAME:PORT
```

Our URL:

```
mongodb://sachin_admin:sachinpass@mongo:27017
```

| Part           | Meaning                |
| -------------- | ---------------------- |
| `sachin_admin` | MongoDB username       |
| `sachinpass`   | MongoDB password       |
| `mongo`        | MongoDB container name |
| `27017`        | MongoDB container port |

**Why `mongo` instead of `localhost`?** Both containers are inside `mongo-network`. Docker's network allows containers to communicate using their **container names**.

**Ports:**

```
Host:27017 → Mongo Container:27017
Host:8081  → Mongo Express Container:8081
```

### 7. Access Mongo Express & Connect MongoDB with Node.js

Once MongoDB and Mongo Express containers are set up, we can access Mongo Express through our local browser.

**a. Start the containers**

```bash
docker start mongo
docker start mongo-express
```

Check:

```bash
docker ps
```

**b. Open Mongo Express**

Mongo Express is available on port `8081`:

```
http://localhost:8081/
```

Because we mapped `Host:8081 → Container:8081`.

**Mongo Express Login**

A username/password popup will appear.

> **Important:** This is _not_ the MongoDB username/password we configured earlier. These are the credentials for the **Mongo Express web interface**.

```
Username: admin
Password: pass
```

**c. Create a database**

After logging in, Mongo Express lets us manage our MongoDB database.

- Click **Create Database**
- Enter: `my-sample-db`
- Click **Create Database (+)**
- Open `my-sample-db`

**d. Create a collection**

Inside `my-sample-db`, create a collection:

- Enter: `users`

```
my-sample-db
    ↓
  users
```

**e. Create a document**

Inside the `users` collection, choose **Create New Document** and add:

```json
{
  "_id": ObjectId(),
  "email": "johndoe@gmail.com",
  "username": "John Doe",
  "password": "secret"
}
```

Click **Save**. Now our MongoDB contains:

```
Database
└── my-sample-db
    └── users
        └── John Doe
```

**f. Connect MongoDB with Node.js**

Now we can connect this MongoDB database to our Node.js application using `MongoClient`. Make sure our Node.js server is running, then use our GET route:

```
http://localhost:3030/getUsers
```

This route gets all users from the database. We should receive the user we just created:

```json
{
  "email": "johndoe@gmail.com",
  "username": "John Doe",
  "password": "secret"
}
```

**g. Test the POST route**

Open:

```
http://localhost:3030/
```

Add a new user through the application/form:

```
Node.js App
     ↓
POST Request
     ↓
MongoDB Container
     ↓
Database
```

We can verify the result in **Mongo Express → my-sample-db → users** — the new user should appear there.

---

## Docker Compose

### Why Do We Need Docker Compose?

So far, we created multiple containers using long `docker run` commands. For example, MongoDB required:

```bash
docker run -d \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=sachin_admin \
  -e MONGO_INITDB_ROOT_PASSWORD=secret \
  --name mongo \
  --network mongo-network \
  mongo
```

This becomes long and confusing, especially when an application has many containers. **Docker Compose** solves this problem by allowing us to define and manage multiple containers from a single YAML file.

### 1. What is Docker Compose?

Docker Compose is a tool for defining and running multi-container applications. Instead of manually running commands for every container, we define everything in one file:

```
docker-compose.yml
        ↓
Containers
Networks
Ports
Environment Variables
Configuration
```

Then we can start the complete setup with one command.

### 2. Compose YAML File

We create a YAML file inside our project. Example:

```
nodeapp/
│
├── index.html
├── server.js
└── mongo.yaml
```

> **YAML** = _YAML Ain't Markup Language._ It is a simple format used to define configuration/instructions.

**About `version`:** Older Compose files commonly used `version: "3.8"`. With modern Docker Compose, `version` is obsolete and unnecessary. If Docker shows the warning _"the attribute `version` is obsolete"_, we can simply remove it.

### 3. Services

The main section is `services`. In Compose, each **service** represents a container/application that Compose should create and manage.

If we need MongoDB and Mongo Express, we define two services:

```yaml
services:
  mongo: ...
  mongo-express: ...
```

So: **2 Services → 2 Containers**

### 4. MongoDB Service

```yaml
services:
  mongo:
    image: mongo:7
    container_name: mongo
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: sachin_admin
      MONGO_INITDB_ROOT_PASSWORD: secret
```

| Key                      | Meaning                                |
| ------------------------ | -------------------------------------- |
| `image: mongo:7`         | Image to use                           |
| `container_name: mongo`  | Custom container name                  |
| `ports: - "27017:27017"` | Host port 27017 → Container port 27017 |
| `environment: ...`       | MongoDB credentials                    |

### 5. Mongo Express Service

```yaml
mongo-express:
  image: mongo-express
  container_name: mongo-express
  ports:
    - "8081:8081"
  environment:
    ME_CONFIG_MONGODB_ADMINUSERNAME: sachin_admin
    ME_CONFIG_MONGODB_ADMINPASSWORD: secret
    ME_CONFIG_MONGODB_SERVER: mongo
```

| Key                                            | Meaning                                                                 |
| ---------------------------------------------- | ----------------------------------------------------------------------- |
| `image: mongo-express`                         | Mongo Express image                                                     |
| `ports: - "8081:8081"`                         | Host 8081 → Container 8081                                              |
| `ME_CONFIG_MONGODB_ADMINUSERNAME` / `PASSWORD` | Credentials used to connect to MongoDB                                  |
| `ME_CONFIG_MONGODB_SERVER: mongo`              | Tells Mongo Express the MongoDB server is the `mongo` service/container |

Because both services are on the Compose network, Mongo Express can communicate with MongoDB using `mongo:27017` instead of `localhost`.

### 6. Docker Network in Compose

Previously, we manually created the network with `docker network create mongo-network`. But with Docker Compose, we normally **don't need to create the network manually** — when we run the Compose file, Docker Compose automatically creates a default network for the application, e.g. `nodeapp_default`:

```
          nodeapp_default
        /                \
Mongo Container ←→ Mongo Express Container
```

Therefore, containers belonging to the same Compose application can communicate with each other using their **service names**.

### 7. Complete `mongo.yaml`

```yaml
services:
  mongo:
    image: mongo:7
    container_name: mongo
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: sachin_admin
      MONGO_INITDB_ROOT_PASSWORD: secret

  mongo-express:
    image: mongo-express
    container_name: mongo-express
    ports:
      - "8081:8081"
    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: sachin_admin
      ME_CONFIG_MONGODB_ADMINPASSWORD: secret
      ME_CONFIG_MONGODB_SERVER: mongo
```

**Environment Variables — Two Valid Styles**

```yaml
# Style 1
environment:
  MONGO_INITDB_ROOT_USERNAME: root
```

```yaml
# Style 2
environment:
  - MONGO_INITDB_ROOT_USERNAME=root
```

### 8. Run Docker Compose

From inside our project directory:

```bash
docker compose -f mongo.yaml up -d
```

**`up`** tells Compose to:

```
Read YAML
   ↓
Create required network
   ↓
Pull required images
   ↓
Create containers
   ↓
Start containers
```

**`-d`** runs the containers in detached/background mode.

So `docker compose -f mongo.yaml up -d` means: _start the complete multi-container setup in the background._

### 9. Stop & Remove Compose Containers

To remove the containers and the Compose-created network:

```bash
docker compose -f mongo.yaml down
```

**`down`** generally:

```
Stop containers
      ↓
Remove containers
      ↓
Remove Compose network
```

> It does **not** remove the images by default.

Data persistence is a separate topic — without a volume, MongoDB data stored inside the container can be lost when the container is removed. We'll use **Docker Volumes** to solve this (see below).

### 10. Verify the Setup

Check running containers:

```bash
docker ps
```

Check networks:

```bash
docker network ls
```

You should see a Compose-created network such as `nodeapp_default`. Then open Mongo Express:

```
http://localhost:8081/
```

Login using Mongo Express's credentials (`admin` / `pass` — the Mongo Express GUI credentials, **not** the MongoDB root credentials).

### 11. Create Database & Test Node App

Open Mongo Express (`http://localhost:8081/`) and create:

- Database → `my-sample-db`
- Collection → `users`

Create a document:

```json
{
  "_id": ObjectId(),
  "email": "johndoe@gmail.com",
  "username": "John Doe",
  "password": "secret"
}
```

Then make sure the Node.js server is running and test:

```
http://localhost:3030/getUsers
```

The user stored in MongoDB should be returned by the Node.js GET route.

---

## Use Case: Dockerizing Our App

So far, our Node.js application is running directly on our system. Now we want to convert/package this application into a **Docker Image**.

Once we have that image, we can either:

- Share/publish the image with others.
- Use the same image to create and run containers.

### What is Dockerizing?

**Dockerizing** an application means creating a Docker Image for that application using a **Dockerfile**.

**Dockerfile** — a file containing instructions that tell Docker how to build an image for our application. We normally create the Dockerfile inside our application:

```
nodeApp/
├── index.html
├── server.js
├── package.json
└── Dockerfile
```

### Dockerizing in Production / CI-CD

In production, this process is often automated through CI/CD pipelines:

```
Code
 ↓
CI/CD Tool (e.g. Jenkins)
 ↓
Build Docker Image
 ↓
Push Image
 ↓
Public / Private Container Registry
```

In our learning, however, we will do this manually without Jenkins or another CI/CD tool.

---

## Dockerfile Instructions

Example Dockerfile from the documentation:

```dockerfile
FROM python:3.13

WORKDIR /usr/local/app

ENV NODE_APP=value
ENV NODE_RUN_HOST=value

COPY requirements.txt requirements.txt

RUN pip install --no-cache-dir -r requirements.txt

COPY src ./src

EXPOSE 8080

RUN useradd app
USER app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

> This example uses Python only to demonstrate Dockerfile instructions. For our Node.js application, we would use a Node image as the base image and Node-specific commands.

### 1. `FROM`

```dockerfile
FROM node:20
```

`FROM` defines the base image. For our Node.js application, Node.js needs to be available first, so we use a Node image.

```
FROM node:20
      ↓
Base Image
      ↓
Provides Node.js environment
```

### 2. `WORKDIR`

```dockerfile
WORKDIR /usr/local/app
```

Defines the working directory inside the image/container. Files will be copied there and commands will be executed from there.

### 3. `ENV`

```dockerfile
ENV NODE_APP=value
ENV NODE_RUN_HOST=value
```

Sets environment variables that will be available to the running container.

**Syntax:** `ENV NAME VALUE`

### 4. `COPY`

```dockerfile
COPY requirements.txt requirements.txt
```

Copies files from our host/project into the image.

**General syntax:** `COPY <source> <destination>`

For example, `COPY . .` means copy the project files into the current working directory inside the image.

### 5. `RUN`

```dockerfile
RUN pip install --no-cache-dir -r requirements.txt
```

`RUN` executes a command while the Docker image is being **built**. For our Node.js application, we might use:

```dockerfile
RUN npm install
```

There can be multiple `RUN` instructions in a Dockerfile:

```
Dockerfile
 ├── RUN command 1
 ├── RUN command 2
 └── RUN command 3
```

### 6. `EXPOSE`

```dockerfile
EXPOSE 8080
```

Indicates the port on which the application is expected to listen inside the container. For a Node.js app running on port 3030:

```dockerfile
EXPOSE 3030
```

> `EXPOSE` does **not** actually publish/bind the port to the host. We still use `-p` when running the container:
>
> ```bash
> docker run -p 3030:3030 IMAGE_NAME
> ```

### 7. `USER`

```dockerfile
RUN useradd app
USER app
```

Creates and switches to a **non-root user** so the application doesn't run as the root user. This is mainly a security practice.

### 8. `CMD`

```dockerfile
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

`CMD` defines the default command that runs when a container is **started** from the image. For our Node.js application:

```dockerfile
CMD ["node", "server.js"]
```

So:

```
Image created
     ↓
Container created
     ↓
Container starts
     ↓
CMD runs
     ↓
node server.js
```

### `RUN` vs `CMD`

| `RUN`                                | `CMD`                               |
| ------------------------------------ | ----------------------------------- |
| Runs while building the image        | Runs when container starts          |
| Used to install/setup things         | Used to start the application       |
| Can have multiple `RUN` instructions | Usually one default `CMD`           |
| Example: `RUN npm install`           | Example: `CMD ["node","server.js"]` |

---

## Creating a Dockerfile & Building Our Node.js Image

Now we will Dockerize our Node.js application by creating a Dockerfile. The Dockerfile contains instructions that tell Docker how to build our application image.

### 1. Define the Base Image — `FROM`

We can write:

```dockerfile
FROM node
```

or specify a particular version:

```dockerfile
FROM node:23.7.0-slim
```

| Part          | Meaning                  |
| ------------- | ------------------------ |
| `node`        | Node.js image            |
| `23.7.0-slim` | Specific version/variant |

**Image Layers**

The `FROM` image itself is built from other layers/images. For example, conceptually:

```
Our Node.js App Image
        ↓
   node:23.7.0-slim
        ↓
debian:bookworm-slim
        ↓
   Base Linux layers
```

So our application image is built on top of the Node image, and the Node image itself can be based on another Linux distribution image. This shows how Docker images are built using layers.

### 2. `ENV` — Environment Variables

```dockerfile
ENV MONGO_DB_USERNAME=sachin_admin \
    MONGO_DB_PWD=secret
```

Defines environment variables that will be available to the application/container:

- `MONGO_DB_USERNAME` → `sachin_admin`
- `MONGO_DB_PWD` → `secret`

### 3. `RUN mkdir`

```dockerfile
RUN mkdir -p delta/nodeapp
```

This creates a directory inside the image:

```
delta/
└── nodeapp/
```

`-p` allows Docker to create the required parent directories as well.

### 4. `COPY`

```dockerfile
COPY . /delta/nodeapp
```

This means:

| Source                                    | Destination                                     |
| ----------------------------------------- | ----------------------------------------------- |
| `.` — Current build context/project files | `/delta/nodeapp` — Destination inside the image |

So our application files are copied into `/delta/nodeapp`. For example:

```
nodeapp/
├── server.js
├── package.json
├── index.html
└── Dockerfile
```

becomes inside the image:

```
/delta/nodeapp/
├── server.js
├── package.json
├── index.html
└── Dockerfile
```

Therefore, if `server.js` is copied there, its path becomes `/delta/nodeapp/server.js`.

### 5. `CMD`

```dockerfile
CMD ["node", "/delta/nodeapp/server.js"]
```

This is the default command executed when a container starts:

- `node` → Run Node.js
- `/delta/nodeapp/server.js` → Path of our `server.js` inside the container

So Docker effectively runs `node /delta/nodeapp/server.js`.

**Why do we give the path?** Because `COPY` placed `server.js` inside `/delta/nodeapp/`. Therefore Docker needs to know where the file is located.

### Our Dockerfile (Initial Version)

```dockerfile
FROM node

ENV MONGO_DB_USERNAME=sachin_admin \
    MONGO_DB_PWD=secret

RUN mkdir -p delta/nodeapp

COPY . /delta/nodeapp

CMD ["node", "/delta/nodeapp/server.js"]
```

### 6. Build the Docker Image

From inside the `nodeapp` directory:

```bash
docker build -t nodeapp:1.0 .
```

| Part           | Meaning                           |
| -------------- | --------------------------------- |
| `docker build` | Build a Docker image              |
| `-t`           | Tag/name the image                |
| `nodeapp:1.0`  | `name:version/tag`                |
| `.`            | Build context = current directory |

Because we're already inside the `nodeapp` folder, Docker uses that folder as the build context and automatically looks for the Dockerfile there by default.

### 7. Verify the Image

```bash
docker images
```

We should see something like:

```
REPOSITORY   TAG   ...
nodeapp      1.0   ...
```

### 8. Create a Container from Our Image

```bash
docker run nodeapp:1.0
```

This creates a container from our `nodeapp:1.0` image and starts it. If our Node.js server starts successfully, we'll see its output in the terminal.

If the application listens on a port, we still need port binding to access it from the host:

```bash
docker run -p 3030:3030 nodeapp:1.0
```

### 9. What About `node_modules`?

When Dockerizing an application, we **don't need to copy** our local `node_modules` into the image. We can remove `node_modules` from our project and let Docker install the dependencies inside the image. For that, we add:

```dockerfile
RUN npm install
```

### Updated Dockerfile

```dockerfile
FROM node

ENV MONGO_DB_USERNAME=sachin_admin \
    MONGO_DB_PWD=secret

RUN mkdir -p delta/nodeapp

COPY . /delta/nodeapp

RUN npm install

CMD ["node", "/delta/nodeapp/server.js"]
```

Flow:

```
COPY
 ↓
Copy package.json and other project files
 ↓
RUN npm install
 ↓
Install dependencies inside the image
 ↓
CMD
 ↓
Start server.js when container starts
```

---

## Publish Docker Image on Docker Hub

Once we have created our Docker image locally, we can publish it to Docker Hub so that we — or anyone else — can pull and use the image later.

### 1. Create a Repository on Docker Hub

Go to Docker Hub → **My Profile → My Hub → Repositories → Create Repository**. Fill in:

| Field           | Value            |
| --------------- | ---------------- |
| Repository Name | `my-nodeapp`     |
| Description     | Optional         |
| Visibility      | Public / Private |

After creating it, our repository will be `sachin624k/my-nodeapp`.

> **Important:** The Docker image name we push must match the Docker Hub repository name.
>
> ```
> Docker Hub Repository
>         ↓
> sachin624k/my-nodeapp
> ```

### 2. Build the Image with the Docker Hub Name

Suppose our local image is currently `nodeapp:1.0`. To push it directly to our Docker Hub repository, build/tag the image using the repository name:

```bash
docker build -t sachin624k/my-nodeapp .
```

| Part         | Meaning             |
| ------------ | ------------------- |
| `sachin624k` | Docker Hub username |
| `my-nodeapp` | Repository name     |

Verify:

```bash
docker images
```

You should see:

```
REPOSITORY              TAG
sachin624k/my-nodeapp   latest
```

> If no tag is specified, Docker uses `latest` by default.

### 3. Login to Docker Hub

Before pushing, we need to authenticate with Docker Hub.

First, if needed:

```bash
docker logout
```

Then:

```bash
docker login
```

Docker may show a message with an authentication URL and a code. Open the provided link:

```
https://login.docker.com/activate
```

Enter the code provided by Docker and complete the login.

### 4. Push the Image to Docker Hub

```bash
docker push sachin624k/my-nodeapp
```

Or explicitly specify the tag:

```bash
docker push sachin624k/my-nodeapp:latest
```

Docker uploads the image layers to the repository:

```
Local Machine
     ↓
Docker Image
     ↓
docker push
     ↓
Docker Hub
     ↓
sachin624k/my-nodeapp
```

After pushing, refresh the Docker Hub repository and the image will be visible there.

### 5. Pull the Image Later

The biggest benefit is that we can delete the local image/application setup and get it back later from Docker Hub.

Pull it using:

```bash
docker pull sachin624k/my-nodeapp:latest
```

Or simply:

```bash
docker pull sachin624k/my-nodeapp
```

Then create a container from it:

```bash
docker run sachin624k/my-nodeapp
```

If the application needs a port:

```bash
docker run -p 3030:3030 sachin624k/my-nodeapp
```

---

## Docker Volumes

### 1. Why Do We Need Volumes?

**Volumes** are persistent data stores for containers. A container has its own filesystem — if we store important data only inside the container, that data can be lost when the container is removed.

Example:

```
Host Machine
     │
     └── Container A
            │
            └── Database/Data
```

If Container A is removed, its internal data can be lost. A volume solves this problem:

```
Host Machine
     │
     ├── Volume
     │      ↕
     │   Container A
     │
     └── Container B
```

The data is stored **separately** from the container. So:

- Container can be stopped and restarted → data remains.
- Container can be removed → volume/data remains.
- Another container can use the same volume.

```
Container = temporary       Volume = persistent
```

### 2. Volume Mounting

We map/mount a volume to a directory inside the container. Anything written to that mounted directory is stored in the volume.

```
Container                                             Volume
/test/data  ───────────────→  Persistent Data
```

The same volume can also be mounted to another container:

```
              myVolume
            ↙        ↘
    Container A   Container B
```

### 3. Example — Bind Mount

Run an Ubuntu container:

```bash
docker run -it -v /Users/sachin624k/Desktop/data:/test/data ubuntu
```

**Syntax:** `-v HOST_PATH:CONTAINER_PATH`

| Path                             | Location       |
| -------------------------------- | -------------- |
| `/Users/sachin624k/Desktop/data` | Host path      |
| `/test/data`                     | Container path |

`-it` allows us to interact with the container through the terminal. Inside the container:

```bash
ls
cd /test/data
touch index.html
touch server.js
ls
```

The files created inside `/test/data` will also appear in:

```
Desktop/data/
├── index.html
└── server.js
```

**Important concept:** Although we created the files from inside the container, the files are actually stored in the host's `Desktop/data` directory because that directory is mounted into the container.

```
Container                                                  Host
/test/data  ─────────────────→  Desktop/data
                              Bind Mount
```

### 4. Test Persistence

Exit the container:

```bash
exit
```

The container stops but still exists. Check:

```bash
docker ps
```

To start it again:

```bash
docker start CONTAINER_ID
```

Enter it:

```bash
docker exec -it CONTAINER_ID /bin/bash
```

Then:

```bash
cd /test/data
ls
```

The files will still be there. Even after:

```bash
docker stop CONTAINER_ID
docker rm CONTAINER_ID
```

the files in the host's `Desktop/data` directory still remain, because the data is outside the container.

### 5. Docker Volumes (Named)

Docker also provides its own volume management system.

List volumes:

```bash
docker volume ls
```

Or view them in **Docker Desktop → Volumes**.

Create a named volume:

```bash
docker volume create myVolume
```

Remove a volume:

```bash
docker volume rm myVolume
```

### 6. Where Does Docker Store Volumes?

Docker manages the actual storage location. Common default locations are:

| OS      | Location                        |
| ------- | ------------------------------- |
| Windows | `C:\ProgramData\docker\volumes` |
| Linux   | `/var/lib/docker/volumes`       |

On Docker Desktop for macOS/Windows, Docker runs inside its own Linux environment, so the underlying volume storage isn't normally a regular host folder you should edit directly. We generally interact with volumes using Docker commands instead of manually accessing their internal storage location.

### 7. Three Ways to Mount Data

Docker mainly gives us these mounting approaches:

**① Named Volume (Recommended)**

Create a volume with a name:

```bash
docker volume create myVolume
```

Then mount it:

```bash
docker run -v myVolume:/test/data ubuntu
```

**Syntax:** `docker run -v VOLUME_NAME:CONTAINER_PATH IMAGE`

If the named volume doesn't exist, Docker can create it automatically when using it with `docker run`.

```
myVolume
    ↕
/test/data
```

**Best for:** Persistent application/database data and production use.

**② Anonymous Volume**

No volume name is provided:

```bash
docker run -v /test/data ubuntu
```

Docker creates an anonymous volume and mounts it at `/test/data`.

**Best for:** Temporary/use-case-specific storage where you don't need to manage the volume by a specific name.

**③ Bind Mount**

We directly specify a host directory:

```bash
docker run -v HOST_DIR:CONTAINER_DIR IMAGE
```

Example:

```bash
docker run -v /Users/sachin624k/Desktop/data:/test/data ubuntu
```

```
Host Directory
      ↕
Container Directory
```

**Best for:** Development, when we want to directly share files between our host and container.

### 8. `-v` vs `--mount`

Docker provides two ways to specify mounts.

Using `-v`:

```bash
docker run --volume myVolume:/test/data ubuntu
```

Short form:

```bash
docker run -v myVolume:/test/data ubuntu
```

Using `--mount`:

```bash
docker run --mount type=volume,src=myVolume,dst=/test/data ubuntu
```

Both can be used to mount a named volume.

### 9. Remove Unused Volumes

Suppose we have many volumes and some are not being used by any container. We can remove unused volumes using:

```bash
docker volume prune
```

> Be careful: this permanently removes volumes that Docker considers unused. It is better to check your volumes with `docker volume ls` before pruning.

---

## Docker Network

Docker Networking allows containers to communicate with each other, the host machine, and the internet.

Check available networks:

```bash
docker network ls
```

By default, Docker provides three built-in networks:

- `bridge`
- `host`
- `none`

Each network uses a different **network driver**, which determines how containers communicate.

### 1. Bridge Network — Default

The `bridge` network is the default network for containers created with `docker run` when no network is specified.

```
                        Host
      ┌───────────────────┐
      │                   │
      │    Container A    │
      │        ↕          │
      │      Bridge       │
      │        ↕          │
      │    Container B    │
      │                   │
      └───────────────────┘
```

Containers connected to a bridge network can generally:

- Communicate with other containers on that network
- Make outgoing connections to the internet
- Communicate with the host through appropriate networking/port publishing

> **Important:** The driver decides how the container communicates with other networks and the outside world.

### 2. Default Bridge vs Custom Bridge

There are two important types of bridge networks.

**Default bridge** — Docker automatically provides a network called `bridge`. If we simply run:

```bash
docker run ubuntu
```

the container is connected to the default bridge.

**Custom bridge** — We can create our own bridge network:

```bash
docker network create my-network
```

Then connect a container:

```bash
docker run --network my-network ubuntu
```

**Why is a custom bridge better?**

Custom bridge networks provide better container-to-container communication. Most importantly, containers on a custom bridge network can communicate using container/service names through Docker's built-in DNS.

Example:

```
           my-network
          /                   \
   MongoDB      Node App
      ↑                           ↑
      └── mongo ───┘
```

Node can connect to MongoDB using its container/service name, for example: `mongodb://mongo:27017`.

With the default bridge, container-name-based DNS is not provided in the same convenient way; you generally need container IPs or other mechanisms.

| Default Bridge                                             | Custom Bridge                            |
| ---------------------------------------------------------- | ---------------------------------------- |
| Created by Docker                                          | Created by us                            |
| Used automatically by `docker run`                         | Must specify/use it                      |
| Basic networking                                           | Better container-to-container networking |
| No convenient automatic name resolution between containers | Automatic DNS/name resolution            |
| Less flexible                                              | More flexible                            |

> For multi-container applications, custom bridge networks are preferred.

### 3. Host Network

The `host` network removes the normal network isolation between the container and the host.

```
         Host
┌─────────────────────┐
│                     │
│     Container       │
│                     │
│  Uses host network  │
│                     │
└─────────────────────┘
```

The container uses the host's networking directly instead of getting its own isolated network namespace.

```bash
docker run --network host IMAGE
```

- Less network isolation
- Container uses host networking
- Port publishing with `-p` is generally not needed/used in the same way

> Mainly useful for specific networking/performance use cases — not something you need frequently as a fresher web developer.

### 4. None Network

The `none` network gives the container no normal network connectivity.

```
Container
    ↓
 No Network
```

```bash
docker run --network none IMAGE
```

The container gets only its loopback interface (`localhost`/`127.0.0.1`) and cannot normally communicate with other containers, the host network, or the internet.

**Use case:** Useful when a container doesn't need network access and we want maximum network isolation.

### How This Fits Our MongoDB Example

Previously we created:

```bash
docker network create mongo-network
```

Then:

```
            mongo-network
           /              \
          ↓                ↓
     MongoDB          Mongo Express
    Container          Container
```

Because both containers are on the same custom bridge network, Mongo Express can connect to MongoDB using `mongo:27017` instead of `localhost:27017`.

This is one of the most important practical uses of Docker networking.

---

## Quick Command Reference

| Command                                  | Purpose                                |
| ---------------------------------------- | -------------------------------------- |
| `docker pull IMAGE`                      | Download an image                      |
| `docker images`                          | List local images                      |
| `docker rmi IMAGE_ID`                    | Remove an image                        |
| `docker run -d --name NAME IMAGE`        | Run a container in the background      |
| `docker ps`                              | List running containers                |
| `docker rm CONTAINER_ID`                 | Remove a container                     |
| `docker logs CONTAINER_ID`               | View container logs                    |
| `docker exec -it CONTAINER_ID /bin/bash` | Enter a running container              |
| `docker start / stop CONTAINER_ID`       | Start / stop a container               |
| `docker network ls`                      | List networks                          |
| `docker network create NAME`             | Create a custom network                |
| `docker volume ls`                       | List volumes                           |
| `docker volume create NAME`              | Create a named volume                  |
| `docker volume prune`                    | Remove unused volumes                  |
| `docker build -t NAME:TAG .`             | Build an image from a Dockerfile       |
| `docker login` / `docker push NAME`      | Authenticate and publish to Docker Hub |
| `docker compose -f FILE up -d`           | Start a multi-container app            |
| `docker compose -f FILE down`            | Stop and remove a multi-container app  |
