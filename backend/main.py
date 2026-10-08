from fastapi import FastAPI

app = FastAPI(title="MIS3032 API")

@app.get("/")
def root():
    return {"message": "MIS3032 environment OK"}

@app.get("/health")
def health():
    return {"status": "ok"}