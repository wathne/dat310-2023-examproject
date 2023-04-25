"""Database handler.

WIP: Database specifications are work in progress and may change.

Database, user specification:
    {
        "userid": int(INTEGER),
        "username": str(TEXT),
        "passwordhash": str(TEXT),
    }
    (userid is PRIMARY KEY)
    (username is UNIQUE)

Database, image specification:
    {
        "imageid": int(INTEGER),
        "userid": int(INTEGER),
        "full": str(TEXT),
        "small": str(TEXT) | None(NULL),
        "medium": str(TEXT) | None(NULL),
        "large": str(TEXT) | None(NULL),
    }
    (imageid is PRIMARY KEY)
    (userid is FOREIGN KEY)

Database, metadata specification:
    {
        "metadataid": int(INTEGER),
        "imageid": int(INTEGER),
        "userid": int(INTEGER),
        "json": str(TEXT),
        "reserved1": str(TEXT) | int(INTEGER) | None(NULL),
        "reserved2": str(TEXT) | int(INTEGER) | None(NULL),
        "reserved3": str(TEXT) | int(INTEGER) | None(NULL),
        "reserved4": str(TEXT) | int(INTEGER) | None(NULL),
        "reserved5": str(TEXT) | int(INTEGER) | None(NULL),
    }
    (metadataid is PRIMARY KEY)
    (imageid is FOREIGN KEY)
    (userid is FOREIGN KEY)
"""

#from sqlite3 import connect
from sqlite3 import Connection
#from sqlite3 import Error as AnySqlite3Error


# TODO(wathne): Implement insert_user().
def insert_user(
    con: Connection, # pylint: disable=unused-argument
    username: str, # pylint: disable=unused-argument
    passwordhash: str, # pylint: disable=unused-argument
) -> int:
    return 0


# TODO(wathne): Implement get_user_by_id().
def get_user_by_id(
    con: Connection, # pylint: disable=unused-argument
    userid: int, # pylint: disable=unused-argument
) -> dict[str, str | int] | None:
    return None


# TODO(wathne): Implement get_user_by_name().
def get_user_by_name(
    con: Connection, # pylint: disable=unused-argument
    username: str, # pylint: disable=unused-argument
) -> dict[str, str | int] | None:
    return None


# TODO(wathne): Implement create_user_table().
# pylint: disable-next=unused-argument
def create_user_table(con: Connection) -> None:
    return None


# TODO(wathne): Implement create_image_table().
# pylint: disable-next=unused-argument
def create_image_table(con: Connection) -> None:
    return None


# TODO(wathne): Implement create_metadata_table().
# pylint: disable-next=unused-argument
def create_metadata_table(con: Connection) -> None:
    return None


if __name__ == "__main__":
    pass

