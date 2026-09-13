import os

from dotenv import load_dotenv
from sqlalchemy import URL, create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

mysql_host = os.getenv("MYSQL_HOST")
mysql_port = int(os.getenv("MYSQL_PORT", "3306"))
mysql_user = os.getenv("MYSQL_USER")
mysql_password = os.getenv("MYSQL_PASSWORD")
mysql_database = os.getenv("MYSQL_DATABASE")

# Local MySQL does not need the TiDB SSL settings.
# TiDB Cloud requires a secure connection.
if mysql_host in ("localhost", "127.0.0.1"):
    DATABASE_URL = URL.create(
        drivername="mysql+pymysql",
        username=mysql_user,
        password=mysql_password,
        host=mysql_host,
        port=mysql_port,
        database=mysql_database,
    )
else:
    DATABASE_URL = URL.create(
        drivername="mysql+pymysql",
        username=mysql_user,
        password=mysql_password,
        host=mysql_host,
        port=mysql_port,
        database=mysql_database,
        query={
            "ssl_verify_cert": "true",
            "ssl_verify_identity": "true",
        },
    )

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()