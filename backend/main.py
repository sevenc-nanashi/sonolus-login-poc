from base64 import b64decode, b64encode
import json
from os import getenv
import secrets
import time
from typing import Optional

from Crypto.Cipher import AES, PKCS1_OAEP
from Crypto.Hash import SHA1
from Crypto.Util.Padding import pad, unpad
import aioredis
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.params import Param
import uvicorn
import i18n
import contextvars
from publickey import PUBLICKEY

load_dotenv()
load_dotenv(".env.local")

i18n.load_path.append("./translations")
i18n.set("file_format", "yml")
i18n.set("fallback", "en")
i18n.set("skip_locale_root_data", True)
i18n.set("filename_format", "{locale}.{format}")

locale = contextvars.ContextVar("locale", default="en")


def t(key: str, **kwargs):
    return i18n.t(key, locale=locale.get(), **kwargs)


app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)
redis = aioredis.from_url(getenv("REDIS_URL"))

IS_PROD = getenv("ENV") == "prod"
IS_DEV = not IS_PROD

if getenv("ENV") != "prod":
    origins = [
        "http://localhost:3000",
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.get("/")
async def read_root():
    return {"Hello": "World"}


@app.post("/api/login")
async def login_create():
    while True:
        nonce = str(secrets.randbelow(99999999)).zfill(8)
        if not await redis.exists("login:" + nonce):
            break
    data = {
        "waiting": True,
    }
    await redis.set("login:" + nonce, json.dumps(data), ex=100)
    return {"nonce": nonce}


@app.get("/api/login/{nonce}")
async def login_check(nonce: str):
    data = await redis.get("login:" + nonce)
    if data is None:
        return {"status": "unknown", "error": "Nonce not found"}
    data = json.loads(data)
    if data["waiting"]:
        return {"status": "waiting"}
    else:
        return {"status": "success", "session": data["session"]}


@app.get("/api/profile")
async def profile_get(
    authorization: str = Header(),
):
    if authorization is None:
        raise HTTPException(status_code=401, detail="Login required")
    session_data = await redis.get("web_session:" + authorization)
    if not session_data:
        raise HTTPException(status_code=401, detail="Invalid session")
    data = json.loads(await redis.get("profile:" + json.loads(session_data)["id"]))
    return data


@app.delete("/api/session")
async def session_delete(
    authorization: str = Header(),
):
    if authorization is None:
        raise HTTPException(status_code=401, detail="Login required")
    await redis.delete("web_session:" + authorization)
    return {"status": "success"}


def sonolus_search():
    return {
        "options": [
            {
                "name": t("search_title"),
                "placeholder": t("search_description"),
                "query": "code",
                "type": "text",
            }
        ]
    }


def dummy_level(key: str, name: str = "login-system", **kwargs):
    return {
        "name": name,
        "version": 1,
        "rating": 0,
        "engine": {
            "name": "login-message",
            "version": 4,
            "title": "（メッセージ）",
            "subtitle": "（メッセージ用）",
        },
        "title": t(key + "_title", **kwargs),
        "artists": t(key + "_description", fallback="", **kwargs),
        "author": " ",
        "cover": {"type": "LevelCover", "url": ""},
        "bgm": {"type": "LevelBgm", "url": ""},
        "data": {"type": "LevelData", "url": ""},
    }


async def sonolus_locale(
    localization: str,
):
    locale.set(localization or "en")


@app.get("/sonolus/info", dependencies=[Depends(sonolus_locale)])
async def sonolus_info():
    return {
        "title": "Sonolus Login PoC: Auth server",
        "levels": {
            "items": [
                dummy_level("welcome"),
            ],
            "search": sonolus_search(),
        },
        "skins": {"items": [], "search": {}},
        "backgrounds": {"items": [], "search": {}},
        "effects": {"items": [], "search": {}},
        "particles": {"items": [], "search": {}},
        "engines": {"items": [], "search": {}},
    }


async def sonolus_auth(
    sonolus_session_id: Optional[str], sonolus_session_data: Optional[str]
):
    if sonolus_session_id is None or sonolus_session_data is None:
        raise HTTPException(status_code=401, detail="Login required")
    data = await redis.get("session:" + sonolus_session_id)
    if data is None:
        raise HTTPException(status_code=401, detail="Invalid session")
    data = json.loads(data)
    aes = AES.new(b64decode(data["key"]), AES.MODE_CBC, b64decode(data["iv"]))
    try:
        decrypted = unpad(aes.decrypt(b64decode(sonolus_session_data)), AES.block_size)
        return json.loads(decrypted.decode("utf8", errors="ignore"), strict=False)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=401, detail="Invalid session")


@app.get("/sonolus/levels/list")
async def sonolus_levels(
    code: Optional[str] = None,
    sonolus_session_id: Optional[str] = Header(None),
    sonolus_session_data: Optional[str] = Header(None),
):
    await sonolus_auth(sonolus_session_id, sonolus_session_data)
    if not code:
        return {
            "items": [
                dummy_level("level_info"),
            ],
            "search": sonolus_search(),
        }
    elif len(code) != 8 or not code.isdigit():
        return {
            "items": [dummy_level("search_invalid")],
            "search": sonolus_search(),
        }
    else:
        return {
            "items": [
                dummy_level(
                    "search_confirm",
                    f"login-{code}",
                    code=code,
                ),
            ],
            "search": sonolus_search(),
        }


@app.get("/sonolus/levels/login-{code}")
async def sonolus_level(
    code: str,
    sonolus_session_id: Optional[str] = Header(None),
    sonolus_session_data: Optional[str] = Header(None),
):
    if code == "system":
        raise HTTPException(status_code=404, detail="Not found")
    auth = await sonolus_auth(sonolus_session_id, sonolus_session_data)
    if await redis.exists("login:" + code):
        data = json.loads(await redis.get("login:" + code))
        if data["waiting"]:
            data["waiting"] = False
            data["session"] = secrets.token_urlsafe(32)
            await redis.set("login:" + code, json.dumps(data), ex=60 * 30)
            await redis.set(
                "web_session:" + data["session"],
                json.dumps({"id": auth["userProfile"]["id"]}),
                ex=60 * 30,
            )
            await redis.set(
                "profile:" + auth["userProfile"]["id"], json.dumps(auth["userProfile"])
            )
            return {"item": dummy_level("login_success", session=data["session"])}
    return {"item": dummy_level("login_failure")}


@app.post("/sonolus/authenticate")
async def sonolus_authenticate(
    host: str = Header(),
):
    session_nonce = secrets.token_urlsafe(32)
    session_data = {
        "id": session_nonce,
        "key": b64encode(secrets.token_bytes(32)).decode(),
        "iv": b64encode(secrets.token_bytes(16)).decode(),
    }

    # aes = AES.new(
    #     key=session_data["key"].encode(),
    #     mode=AES.MODE_CBC,
    #     iv=session_data["iv"].encode(),
    # )
    # encrypted = aes.encrypt(pad(json.dumps(session_data).encode(), AES.block_size))

    oaep = PKCS1_OAEP.new(key=PUBLICKEY, hashAlgo=SHA1)
    session_id = b64encode(oaep.encrypt(json.dumps(session_data).encode())).decode()

    await redis.set("session:" + session_nonce, json.dumps(session_data), ex=60 * 30)

    return {
        "address": getenv("HOST", "http://" + host),
        "session": session_id,
        "expiration": int((time.time() + 60 * 30) * 1000),
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
