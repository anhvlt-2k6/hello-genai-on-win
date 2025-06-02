# Hello GenAI on Windows

Simple GenAI application to run the Docker Model, but on Windows (Windows 11 + WSL2)

## Environment Variables

The application uses the following environment variables defined in the `.env` file:

- `LLM_BASE_URL`: The base URL of the LLM API (Don't change in case you need to switch to another provider not Docker)
- `LLM_MODEL_NAME`: The model name to use

By default, `ai/smollm2` is used to make sure your GenAI deployment is functional. You can try pulling other models on [Docker Model on Docker Hub](https://hub.docker.com/u/ai) and edit the model in file `.env`.

Moreover, I have rewrited the `docker-compose.yml` for only accessible via `localhost`. You can allow for any network interface by editing this following line

```yml
7      - "127.0.0.1:8080:8080"
```

to 

```yml
7      - "8080:8080"
```

## Quick Start

1. Clone the repository:

```cmd
git clone https://github.com/anhvlt-2k6/hello-genai-on-win.git
cd hello-genai
```

1. Run the application using the script (or double-click it, much faster):

```cmd
run.cmd
```

1. Open (in your browser) the following link: http://localhost:8080

## Requirements

- Windows 11 (recommended 23H2 and later). Windows 10 and Windows 11 21H2/22H2 is still usable, but may experience lagging or InterNet disconnection while using.
- WSL2. Make sure you have updated to the latest version and set `wsl --set-default-version 2` as default.
  - If you don't know what WSL is, you can try [install with this guide](https://learn.microsoft.com/en-us/windows/wsl/install) and this [Getting Started Guide](https://youtu.be/_fntjriRe48?si=VexhJm6bb44m3CbF)
- Make sure Docker operates on WSL2 with [GPU support](https://docs.docker.com/desktop/features/gpu/).
