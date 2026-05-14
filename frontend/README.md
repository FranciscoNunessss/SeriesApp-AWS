
  # Execute User Instructions

  This is a code bundle for Execute User Instructions. The original project is available at https://www.figma.com/design/8uodpj32BEbZj19GR4i1qE/Execute-User-Instructions.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

The frontend talks to the backend at `http://localhost:8000/api/v1` by default.
If you need a different address, set `VITE_API_BASE_URL` before starting Vite.

To run the frontend in Docker production mode, use:

```bash
docker compose --profile prod up -d --build
```

Then open `http://localhost:3000`.

For local development with hot reload inside Docker, use:

```bash
docker compose up -d --build
```

Then open `http://localhost:5173`.
  