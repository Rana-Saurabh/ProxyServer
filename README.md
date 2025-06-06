## Prerequisites-

Before you begin, ensure you have met the following requirements:

- **Node.js**: Make sure you have Node.js installed. You can download it from [Node.js official website](https://nodejs.org/).
- **npm**: npm is typically installed with Node.js. You can verify the installation by running the following commands:
  ```bash
  node -v
  npm -v
  ```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Rana-Saurabh/ProxyServer.git
   cd caching-proxy
   ```

2. Install the node dependencies:
   ```bash
   npm install
   ```

## Usage

### Starting the Caching Proxy Server

To start the caching proxy server, run the following command:

```bash
node ./index.js start --port <number> --origin <Main Server ip with port>
```

- `--port`: The port on which the caching proxy server will run.
- `--origin`: The URL of the origin server to which the requests will be forwarded.

Example:

```bash
node ./index.js start --port 3000 --origin http://dummyjson.com
```
start python server on same or other machine at diffrent port
```bash
python -m http.server 8088
```
In this example, the Node server will start on port `3000` and forward requests to `http://dummyjson.com`.

### Clearing the Cache

You can clear the cache by running the following command:

```bash
node ./index.js clear-cache
```


Example 
## CC
https://roadmap.sh/projects/caching-server
