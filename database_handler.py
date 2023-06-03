"""Database handler.

WIP: Database table specifications are work in progress and may change.

Database users table:
    {
        "user_group": int(INTEGER),
        "user_id": int(INTEGER),
        "user_name": str(TEXT),
        "user_password_hash": str(TEXT),
        "user_timestamp": int(INTEGER),
    }
    (user_id is PRIMARY KEY)
    (user_name is UNIQUE)

Database images table:
    {
        "image_file_extension": str(TEXT),
        "image_file_name": str(TEXT),
        "image_id": int(INTEGER),
        "image_timestamp": int(INTEGER),
        "user_id": int(INTEGER),
    }
    (image_id is PRIMARY KEY)
    (user_id is FOREIGN KEY)

Database threads table:
    {
        "post_id": int(INTEGER) | None(NULL),
        "thread_id": int(INTEGER),
        "thread_last_modified": int(INTEGER),
        "thread_subject": str(TEXT),
        "thread_timestamp": int(INTEGER),
        "user_id": int(INTEGER),
    }
    (post_id is FOREIGN KEY or NULL)
    (thread_id is PRIMARY KEY)
    (user_id is FOREIGN KEY)

Database posts table:
    {
        "image_id": int(INTEGER) | None(NULL),
        "post_id": int(INTEGER),
        "post_last_modified": int(INTEGER),
        "post_text": str(TEXT),
        "post_timestamp": int(INTEGER),
        "thread_id": int(INTEGER),
        "user_id": int(INTEGER),
    }
    (image_id is FOREIGN KEY or NULL)
    (post_id is PRIMARY KEY)
    (thread_id is FOREIGN KEY)
    (user_id is FOREIGN KEY)
"""

from collections.abc import Callable
from sqlite3 import connect
from sqlite3 import Connection
from sqlite3 import Cursor
from sqlite3 import Error as AnySqlite3Error
from sqlite3 import IntegrityError
from sqlite3 import Row
from time import time
from typing import cast


def insert_user(
    db_con: Connection,
    user_name: str,
    user_password_hash: str,
    user_group: int | None = None,
) -> int:
    print("Database: Creating user ...")
    if user_group is None:
        user_group = 0
        print("Database: user_group = 0, as fallback.")
    timestamp: float = time() # Unix time.
    user_timestamp: int = 0
    try:
        user_timestamp = int(timestamp)
        print(f"Database: user_timestamp = {user_timestamp}, Unix time.")
    except (TypeError, ValueError) as int_error:
        print(int_error)
        print("Database: user_timestamp = 0, Unix time, as fallback.")
        pass
    sql: str = (
        "INSERT INTO users ("
            "user_group, "
            "user_name, "
            "user_password_hash, "
            "user_timestamp"
        ") VALUES ("
            ":user_group, "
            ":user_name, "
            ":user_password_hash, "
            ":user_timestamp"
        ");"
    )
    parameters: dict[str, str | int] = {
        "user_group": user_group,
        "user_name": user_name,
        "user_password_hash": user_password_hash,
        "user_timestamp": user_timestamp,
    }
    db_cur: Cursor
    user_id: int | None = None
    try:
        with db_con:
            db_cur = db_con.cursor()
            db_cur.execute(sql, parameters)
            user_id = db_cur.lastrowid
    except IntegrityError as integrity_error:
        print(integrity_error)
        # TODO: Make this more robust.
        if (integrity_error.args[0] ==
                "UNIQUE constraint failed: users.user_name"):
            print("Database: user_name already exists.")
            print("Database: User creation failed.")
            return -2
        print("Database: User creation failed.")
        return -1
    except AnySqlite3Error as err:
        print(err)
        print("Database: User creation failed.")
        return -1
    else:
        if user_id is None:
            print("Database: user_id is None.")
            print("Database: User creation failed.")
            return -1
        print("Database: User creation completed successfully.")
        return user_id
    finally:
        # The finally clause is always executed on the way out.
        db_cur.close()


def retrieve_user_by_id(
    db_con: Connection,
    user_id: int,
) -> dict[str, str | int] | None:
    print("Database: Retrieving user ...")
    sql: str = (
        "SELECT "
            "user_group, "
            "user_id, "
            "user_name, "
            "user_password_hash, "
            "user_timestamp"
        " FROM users WHERE user_id = :user_id;"
    )
    parameters: dict[str, int] = {
        "user_id": user_id,
    }
    db_cur: Cursor
    db_cur_row: Row
    rows: list[Row] = []
    row: Row
    user: dict[str, str | int] = {}
    try:
        with db_con:
            db_cur = db_con.cursor()
            db_cur.row_factory = cast(Callable[[Cursor, Row], Row], Row)
            db_cur.execute(sql, parameters)
            # TODO(wathne): For safety, limit this to 1 iteration.
            for db_cur_row in db_cur:
                rows.append(db_cur_row)
    except AnySqlite3Error as err:
        print(err)
        print("Database: User retrieval failed.")
        return None
    else:
        if not rows:
            print("Database: List of retrieved rows is empty.")
            print("Database: User retrieval failed.")
            return None
        row = rows[0]
        try:
            user["user_group"] = int(row["user_group"])
        except (TypeError, ValueError) as int_error:
            print(int_error)
            user["user_group"] = 0
            print("Database: user_group = 0, as fallback.")
        try:
            user["user_id"] = int(row["user_id"])
        except (TypeError, ValueError) as int_error:
            print(int_error)
            print("Database: User retrieval failed.")
            return None
        user["user_name"] = str(row["user_name"])
        user["user_password_hash"] = str(row["user_password_hash"])
        try:
            user["user_timestamp"] = int(row["user_timestamp"])
        except (TypeError, ValueError) as int_error:
            print(int_error)
            user["user_timestamp"] = 0
            print("Database: user_timestamp = 0, Unix time, as fallback.")
        print("Database: User retrieval completed successfully.")
        return user
    finally:
        # The finally clause is always executed on the way out.
        db_cur.close()


def retrieve_user_by_name(
    db_con: Connection,
    user_name: str,
) -> dict[str, str | int] | None:
    print("Database: Retrieving user ...")
    sql: str = (
        "SELECT "
            "user_group, "
            "user_id, "
            "user_name, "
            "user_password_hash, "
            "user_timestamp"
        " FROM users WHERE user_name = :user_name;"
    )
    parameters: dict[str, str] = {
        "user_name": user_name,
    }
    db_cur: Cursor
    db_cur_row: Row
    rows: list[Row] = []
    row: Row
    user: dict[str, str | int] = {}
    try:
        with db_con:
            db_cur = db_con.cursor()
            db_cur.row_factory = cast(Callable[[Cursor, Row], Row], Row)
            db_cur.execute(sql, parameters)
            # TODO(wathne): For safety, limit this to 1 iteration.
            for db_cur_row in db_cur:
                rows.append(db_cur_row)
    except AnySqlite3Error as err:
        print(err)
        print("Database: User retrieval failed.")
        return None
    else:
        if not rows:
            print("Database: List of retrieved rows is empty.")
            print("Database: User retrieval failed.")
            return None
        row = rows[0]
        try:
            user["user_group"] = int(row["user_group"])
        except (TypeError, ValueError) as int_error:
            print(int_error)
            user["user_group"] = 0
            print("Database: user_group = 0, as fallback.")
        try:
            user["user_id"] = int(row["user_id"])
        except (TypeError, ValueError) as int_error:
            print(int_error)
            print("Database: User retrieval failed.")
            return None
        user["user_name"] = str(row["user_name"])
        user["user_password_hash"] = str(row["user_password_hash"])
        try:
            user["user_timestamp"] = int(row["user_timestamp"])
        except (TypeError, ValueError) as int_error:
            print(int_error)
            user["user_timestamp"] = 0
            print("Database: user_timestamp = 0, Unix time, as fallback.")
        print("Database: User retrieval completed successfully.")
        return user
    finally:
        # The finally clause is always executed on the way out.
        db_cur.close()


def insert_image(
    db_con: Connection,
    user_id: int,
    image_file_name: str,
    image_file_extension: str,
) -> int:
    print("Database: Creating image ...")
    timestamp: float = time() # Unix time.
    image_timestamp: int = 0
    try:
        image_timestamp = int(timestamp)
        print(f"Database: image_timestamp = {image_timestamp}, Unix time.")
    except (TypeError, ValueError) as int_error:
        print(int_error)
        print("Database: image_timestamp = 0, Unix time, as fallback.")
        pass
    sql: str = (
        "INSERT INTO images ("
            "image_file_extension, "
            "image_file_name, "
            "image_timestamp, "
            "user_id"
        ") VALUES ("
            ":image_file_extension, "
            ":image_file_name, "
            ":image_timestamp, "
            ":user_id"
        ");"
    )
    parameters: dict[str, str | int] = {
        "image_file_extension": image_file_extension,
        "image_file_name": image_file_name,
        "image_timestamp": image_timestamp,
        "user_id": user_id,
    }
    db_cur: Cursor
    image_id: int | None = None
    try:
        with db_con:
            db_cur = db_con.cursor()
            db_cur.execute(sql, parameters)
            image_id = db_cur.lastrowid
    except AnySqlite3Error as err:
        print(err)
        print("Database: Image creation failed.")
        return -1
    else:
        if image_id is None:
            print("Database: image_id is None.")
            print("Database: Image creation failed.")
            return -1
        print("Database: Image creation completed successfully.")
        return image_id
    finally:
        # The finally clause is always executed on the way out.
        db_cur.close()


def retrieve_image(
    db_con: Connection,
    image_id: int,
) -> dict[str, str | int] | None:
    print("Database: Retrieving image ...")
    sql: str = (
        "SELECT "
            "image_file_extension, "
            "image_file_name, "
            "image_id, "
            "image_timestamp, "
            "user_id"
        " FROM images WHERE image_id = :image_id;"
    )
    parameters: dict[str, int] = {
        "image_id": image_id,
    }
    db_cur: Cursor
    db_cur_row: Row
    rows: list[Row] = []
    row: Row
    image: dict[str, str | int] = {}
    try:
        with db_con:
            db_cur = db_con.cursor()
            db_cur.row_factory = cast(Callable[[Cursor, Row], Row], Row)
            db_cur.execute(sql, parameters)
            # TODO(wathne): For safety, limit this to 1 iteration.
            for db_cur_row in db_cur:
                rows.append(db_cur_row)
    except AnySqlite3Error as err:
        print(err)
        print("Database: Image retrieval failed.")
        return None
    else:
        if not rows:
            print("Database: List of retrieved rows is empty.")
            print("Database: Image retrieval failed.")
            return None
        row = rows[0]
        image["image_file_extension"] = str(row["image_file_extension"])
        image["image_file_name"] = str(row["image_file_name"])
        try:
            image["image_id"] = int(row["image_id"])
        except (TypeError, ValueError) as int_error:
            print(int_error)
            print("Database: Image retrieval failed.")
            return None
        try:
            image["image_timestamp"] = int(row["image_timestamp"])
        except (TypeError, ValueError) as int_error:
            print(int_error)
            image["image_timestamp"] = 0
            print("Database: image_timestamp = 0, Unix time, as fallback.")
        try:
            image["user_id"] = int(row["user_id"])
        except (TypeError, ValueError) as int_error:
            print(int_error)
            print("Database: Image retrieval failed.")
            return None
        print("Database: Image retrieval completed successfully.")
        return image
    finally:
        # The finally clause is always executed on the way out.
        db_cur.close()


def insert_thread(
    db_con: Connection,
    user_id: int,
    thread_subject: str,
    post_text: str | None = None,
    image_id: int | None = None,
) -> int:
    print("Database: Creating thread ...")
    if post_text is None:
        post_text = ""
        print("Database: post_text set to empty string, as fallback.")
    timestamp: float = time() # Unix time.
    thread_timestamp: int = 0
    try:
        thread_timestamp = int(timestamp)
        print(f"Database: thread_timestamp = {thread_timestamp}, Unix time.")
    except (TypeError, ValueError) as int_error:
        print(int_error)
        print("Database: thread_timestamp = 0, Unix time, as fallback.")
        pass
    sql_thread_insert: str = (
        "INSERT INTO threads ("
            "post_id, "
            "thread_last_modified, "
            "thread_subject, "
            "thread_timestamp, "
            "user_id"
        ") VALUES ("
            ":post_id, "
            ":thread_last_modified, "
            ":thread_subject, "
            ":thread_timestamp, "
            ":user_id"
        ");"
    )
    sql_post_insert: str = (
        "INSERT INTO posts ("
            "image_id, "
            "post_last_modified, "
            "post_text, "
            "post_timestamp, "
            "thread_id, "
            "user_id"
        ") VALUES ("
            ":image_id, "
            ":post_last_modified, "
            ":post_text, "
            ":post_timestamp, "
            ":thread_id, "
            ":user_id"
        ");"
    )
    sql_thread_update: str = (
        "UPDATE threads SET "
            "post_id = :post_id"
        " WHERE thread_id = :thread_id;"
    )
    parameters: dict[str, str | int | None] = {
        "image_id": image_id,
        "post_id": None,
        "post_last_modified": thread_timestamp,
        "post_text": post_text,
        "post_timestamp": thread_timestamp,
        "thread_id": None,
        "thread_last_modified": thread_timestamp,
        "thread_subject": thread_subject,
        "thread_timestamp": thread_timestamp,
        "user_id": user_id,
    }
    db_cur: Cursor
    post_id: int | None = None
    thread_id: int | None = None
    try:
        with db_con:
            db_cur = db_con.cursor()
            # thread insert
            db_cur.execute(sql_thread_insert, parameters)
            thread_id = db_cur.lastrowid
            parameters["thread_id"] = thread_id
            # post insert
            db_cur.execute(sql_post_insert, parameters)
            post_id = db_cur.lastrowid
            parameters["post_id"] = post_id
            # thread update
            db_cur.execute(sql_thread_update, parameters)
    except AnySqlite3Error as err:
        print(err)
        print("Database: Thread creation failed.")
        return -1
    else:
        if thread_id is None:
            print("Database: thread_id is None.")
            print("Database: Thread creation failed.")
            return -1
        if post_id is None:
            print("Database: post_id is None.")
            print("Database: Thread creation failed.")
            # TODO: Delete thread.
            return -1
        print("Database: Thread creation completed successfully.")
        return thread_id
    finally:
        # The finally clause is always executed on the way out.
        db_cur.close()


# TODO(wathne): Return -400 if any function arguments are fatally bad.
# TODO(wathne): Return -403 if user_id does not match.
# TODO(wathne): Return -404 if thread is not found.
# TODO(wathne): Delete orphaned images or make a scheduled janitor function.
def update_thread(
    db_con: Connection,
    user_id: int,
    thread_id: int,
    thread_subject: str,
    post_text: str | None = None,
    image_id: int | None = None,
) -> int:
    print("Database: Updating thread ...")
    if post_text is None:
        post_text = ""
        print("Database: post_text set to empty string, as fallback.")
    timestamp: float = time() # Unix time.
    thread_timestamp: int = 0
    try:
        thread_timestamp = int(timestamp)
        print(f"Database: thread_timestamp = {thread_timestamp}, Unix time.")
    except (TypeError, ValueError) as int_error:
        print(int_error)
        print("Database: thread_timestamp = 0, Unix time, as fallback.")
        pass
    sql_post_id_select: str = (
        "SELECT "
            "post_id"
        " FROM threads WHERE thread_id = :thread_id;"
    )
    sql_post_update: str = (
        "UPDATE posts SET "
            "image_id = :image_id, "
            "post_last_modified = :post_last_modified, "
            "post_text = :post_text"
        " WHERE post_id = :post_id;"
    )
    sql_thread_update: str = (
        "UPDATE threads SET "
            "thread_last_modified = :thread_last_modified, "
            "thread_subject = :thread_subject"
        " WHERE thread_id = :thread_id;"
    )
    parameters: dict[str, str | int | None] = {
        "image_id": image_id,
        "post_id": None,
        "post_last_modified": thread_timestamp,
        "post_text": post_text,
        "thread_id": thread_id,
        "thread_last_modified": thread_timestamp,
        "thread_subject": thread_subject,
        "user_id": user_id,
    }
    db_cur: Cursor
    db_cur_row: Row
    post_id: int | None = None
    try:
        with db_con:
            db_cur = db_con.cursor()
            db_cur.row_factory = cast(Callable[[Cursor, Row], Row], Row)
            # post_id select
            db_cur.execute(sql_post_id_select, parameters)
            for db_cur_row in db_cur:
                post_id = db_cur_row["post_id"]
                if post_id is None:
                    break
                parameters["post_id"] = post_id
                # post update
                db_cur.execute(sql_post_update, parameters)
                break
            # thread update
            db_cur.execute(sql_thread_update, parameters)
    except AnySqlite3Error as err:
        print(err)
        print("Database: Thread update failed.")
        return -500
    else:
        if post_id is None:
            print("Database: post_id is None. Skipping post update.")
        print("Database: Thread update completed successfully.")
        return thread_id
    finally:
        # The finally clause is always executed on the way out.
        db_cur.close()


# TODO(wathne): Return -400 if any function arguments are fatally bad.
# TODO(wathne): Return -403 if user_id does not match.
# TODO(wathne): Return -404 if thread is not found.
# TODO(wathne): Delete orphaned posts or make a scheduled janitor function.
# TODO(wathne): Delete orphaned images or make a scheduled janitor function.
def delete_thread(
    db_con: Connection,
    user_id: int,
    thread_id: int,
) -> int:
    print("Database: Deleting thread ...")
    sql_post_id_select: str = (
        "SELECT "
            "post_id"
        " FROM threads WHERE thread_id = :thread_id;"
    )
    sql_post_delete: str = (
        "DELETE"
        " FROM posts WHERE post_id = :post_id;"
    )
    sql_thread_delete: str = (
        "DELETE"
        " FROM threads WHERE thread_id = :thread_id;"
    )
    parameters: dict[str, int | None] = {
        "post_id": None,
        "thread_id": thread_id,
        "user_id": user_id,
    }
    db_cur: Cursor
    db_cur_row: Row
    post_id: int | None = None
    try:
        with db_con:
            db_cur = db_con.cursor()
            db_cur.row_factory = cast(Callable[[Cursor, Row], Row], Row)
            # post_id select
            db_cur.execute(sql_post_id_select, parameters)
            for db_cur_row in db_cur:
                post_id = db_cur_row["post_id"]
                if post_id is None:
                    break
                parameters["post_id"] = post_id
                # post delete
                db_cur.execute(sql_post_delete, parameters)
                break
            # thread delete
            db_cur.execute(sql_thread_delete, parameters)
    except AnySqlite3Error as err:
        print(err)
        print("Database: Thread deletion failed.")
        return -500
    else:
        if post_id is None:
            print("Database: post_id is None. Skipping post deletion.")
        print("Database: Thread deletion completed successfully.")
        return thread_id
    finally:
        # The finally clause is always executed on the way out.
        db_cur.close()


def retrieve_thread(
    db_con: Connection,
    thread_id: int,
) -> dict[str, str | int | None] | None:
    print("Database: Retrieving thread ...")
    sql: str = (
        "SELECT "
            "post_id, "
            "thread_id, "
            "thread_last_modified, "
            "thread_subject, "
            "thread_timestamp, "
            "user_id"
        " FROM threads WHERE thread_id = :thread_id;"
    )
    parameters: dict[str, int] = {
        "thread_id": thread_id,
    }
    db_cur: Cursor
    db_cur_row: Row
    rows: list[Row] = []
    row: Row
    thread: dict[str, str | int | None] = {}
    try:
        with db_con:
            db_cur = db_con.cursor()
            db_cur.row_factory = cast(Callable[[Cursor, Row], Row], Row)
            db_cur.execute(sql, parameters)
            # TODO(wathne): For safety, limit this to 1 iteration.
            for db_cur_row in db_cur:
                rows.append(db_cur_row)
    except AnySqlite3Error as err:
        print(err)
        print("Database: Thread retrieval failed.")
        return None
    else:
        if not rows:
            print("Database: List of retrieved rows is empty.")
            print("Database: Thread retrieval failed.")
            return None
        row = rows[0]
        if row["post_id"] is None:
            thread["post_id"] = None
            print("Database: post_id = None.")
        else:
            try:
                thread["post_id"] = int(row["post_id"])
            except (TypeError, ValueError) as int_error:
                print(int_error)
                thread["post_id"] = None
                print("Database: post_id = None, as fallback.")
        try:
            thread["thread_id"] = int(row["thread_id"])
        except (TypeError, ValueError) as int_error:
            print(int_error)
            print("Database: Thread retrieval failed.")
            return None
        try:
            thread["thread_last_modified"] = int(row["thread_last_modified"])
        except (TypeError, ValueError) as int_error:
            print(int_error)
            thread["thread_last_modified"] = 0
            print("Database: thread_last_modified = 0, Unix time, as fallback.")
        thread["thread_subject"] = str(row["thread_subject"])
        try:
            thread["thread_timestamp"] = int(row["thread_timestamp"])
        except (TypeError, ValueError) as int_error:
            print(int_error)
            thread["thread_timestamp"] = 0
            print("Database: thread_timestamp = 0, Unix time, as fallback.")
        try:
            thread["user_id"] = int(row["user_id"])
        except (TypeError, ValueError) as int_error:
            print(int_error)
            print("Database: Thread retrieval failed.")
            return None
        print("Database: Thread retrieval completed successfully.")
        return thread
    finally:
        # The finally clause is always executed on the way out.
        db_cur.close()


def retrieve_threads(
    db_con: Connection,
) -> list[dict[str, str | int | None]] | None:
    print("Database: Retrieving threads ...")
    sql: str = (
        "SELECT "
            "post_id, "
            "thread_id, "
            "thread_last_modified, "
            "thread_subject, "
            "thread_timestamp, "
            "user_id"
        " FROM threads;"
    )
    db_cur: Cursor
    db_cur_row: Row
    rows: list[Row] = []
    row: Row
    threads: list[dict[str, str | int | None]] = []
    thread: dict[str, str | int | None] = {}
    try:
        with db_con:
            db_cur = db_con.cursor()
            db_cur.row_factory = cast(Callable[[Cursor, Row], Row], Row)
            db_cur.execute(sql)
            for db_cur_row in db_cur:
                rows.append(db_cur_row)
    except AnySqlite3Error as err:
        print(err)
        print("Database: Threads retrieval failed.")
        return None
    else:
        if not rows:
            print("Database: List of retrieved rows is empty.")
            print("Database: Threads retrieval failed.")
            return None
        for row in rows:
            thread = {}
            if row["post_id"] is None:
                thread["post_id"] = None
                print("Database: post_id = None.")
            else:
                try:
                    thread["post_id"] = int(row["post_id"])
                except (TypeError, ValueError) as int_error:
                    print(int_error)
                    thread["post_id"] = None
                    print("Database: post_id = None, as fallback.")
            try:
                thread["thread_id"] = int(row["thread_id"])
            except (TypeError, ValueError) as int_error:
                print(int_error)
                print("Database: Thread retrieval failed. Skipping thread.")
                continue
            try:
                thread["thread_last_modified"] = int(
                    row["thread_last_modified"])
            except (TypeError, ValueError) as int_error:
                print(int_error)
                thread["thread_last_modified"] = 0
                print("Database: thread_last_modified = 0, Unix time, as "
                      "fallback.")
            thread["thread_subject"] = str(row["thread_subject"])
            try:
                thread["thread_timestamp"] = int(row["thread_timestamp"])
            except (TypeError, ValueError) as int_error:
                print(int_error)
                thread["thread_timestamp"] = 0
                print("Database: thread_timestamp = 0, Unix time, as fallback.")
            try:
                thread["user_id"] = int(row["user_id"])
            except (TypeError, ValueError) as int_error:
                print(int_error)
                print("Database: Thread retrieval failed. Skipping thread.")
                continue
            threads.append(thread)
        if not threads:
            print("Database: List of retrieved threads is empty.")
            print("Database: Threads retrieval failed.")
            return None
        print("Database: Threads retrieval completed successfully.")
        return threads
    finally:
        # The finally clause is always executed on the way out.
        db_cur.close()


def insert_post(
    db_con: Connection,
    user_id: int,
    thread_id: int,
    post_text: str | None = None,
    image_id: int | None = None,
) -> int:
    print("Database: Creating post ...")
    if post_text is None:
        post_text = ""
        print("Database: post_text set to empty string, as fallback.")
    timestamp: float = time() # Unix time.
    post_timestamp: int = 0
    try:
        post_timestamp = int(timestamp)
        print(f"Database: post_timestamp = {post_timestamp}, Unix time.")
    except (TypeError, ValueError) as int_error:
        print(int_error)
        print("Database: post_timestamp = 0, Unix time, as fallback.")
        pass
    sql: str = (
        "INSERT INTO posts ("
            "image_id, "
            "post_last_modified, "
            "post_text, "
            "post_timestamp, "
            "thread_id, "
            "user_id"
        ") VALUES ("
            ":image_id, "
            ":post_last_modified, "
            ":post_text, "
            ":post_timestamp, "
            ":thread_id, "
            ":user_id"
        ");"
    )
    parameters: dict[str, str | int | None] = {
        "image_id": image_id,
        "post_last_modified": post_timestamp,
        "post_text": post_text,
        "post_timestamp": post_timestamp,
        "thread_id": thread_id,
        "user_id": user_id,
    }
    db_cur: Cursor
    post_id: int | None = None
    try:
        with db_con:
            db_cur = db_con.cursor()
            db_cur.execute(sql, parameters)
            post_id = db_cur.lastrowid
    except AnySqlite3Error as err:
        print(err)
        print("Database: Post creation failed.")
        return -1
    else:
        if post_id is None:
            print("Database: post_id is None.")
            print("Database: Post creation failed.")
            return -1
        print("Database: Post creation completed successfully.")
        return post_id
    finally:
        # The finally clause is always executed on the way out.
        db_cur.close()


# TODO(wathne): Return -400 if any function arguments are fatally bad.
# TODO(wathne): Return -403 if user_id does not match.
# TODO(wathne): Return -404 if post is not found.
# TODO(wathne): Delete orphaned images or make a scheduled janitor function.
def update_post(
    db_con: Connection,
    user_id: int,
    post_id: int,
    post_text: str | None = None,
    image_id: int | None = None,
) -> int:
    print("Database: Updating post ...")
    if post_text is None:
        post_text = ""
        print("Database: post_text set to empty string, as fallback.")
    timestamp: float = time() # Unix time.
    post_timestamp: int = 0
    try:
        post_timestamp = int(timestamp)
        print(f"Database: post_timestamp = {post_timestamp}, Unix time.")
    except (TypeError, ValueError) as int_error:
        print(int_error)
        print("Database: post_timestamp = 0, Unix time, as fallback.")
        pass
    sql: str = (
        "UPDATE posts SET "
            "image_id = :image_id, "
            "post_last_modified = :post_last_modified, "
            "post_text = :post_text"
        " WHERE post_id = :post_id;"
    )
    parameters: dict[str, str | int | None] = {
        "image_id": image_id,
        "post_id": post_id,
        "post_last_modified": post_timestamp,
        "post_text": post_text,
        "user_id": user_id,
    }
    db_cur: Cursor
    try:
        with db_con:
            db_cur = db_con.cursor()
            db_cur.execute(sql, parameters)
    except AnySqlite3Error as err:
        print(err)
        print("Database: Post update failed.")
        return -500
    else:
        print("Database: Post update completed successfully.")
        return post_id
    finally:
        # The finally clause is always executed on the way out.
        db_cur.close()


# TODO(wathne): Return -400 if any function arguments are fatally bad.
# TODO(wathne): Return -403 if user_id does not match.
# TODO(wathne): Return -404 if post is not found.
# TODO(wathne): Delete orphaned images or make a scheduled janitor function.
def delete_post(
    db_con: Connection,
    user_id: int,
    post_id: int,
) -> int:
    print("Database: Deleting post ...")
    sql: str = (
        "DELETE"
        " FROM posts WHERE post_id = :post_id;"
    )
    parameters: dict[str, int] = {
        "post_id": post_id,
        "user_id": user_id,
    }
    db_cur: Cursor
    try:
        with db_con:
            db_cur = db_con.cursor()
            db_cur.execute(sql, parameters)
    except AnySqlite3Error as err:
        print(err)
        print("Database: Post deletion failed.")
        return -500
    else:
        print("Database: Post deletion completed successfully.")
        return post_id
    finally:
        # The finally clause is always executed on the way out.
        db_cur.close()


def retrieve_post(
    db_con: Connection,
    post_id: int,
) -> dict[str, str | int | None] | None:
    print("Database: Retrieving post ...")
    sql: str = (
        "SELECT "
            "image_id, "
            "post_id, "
            "post_last_modified, "
            "post_text, "
            "post_timestamp, "
            "thread_id, "
            "user_id"
        " FROM posts WHERE post_id = :post_id;"
    )
    parameters: dict[str, int] = {
        "post_id": post_id,
    }
    db_cur: Cursor
    db_cur_row: Row
    rows: list[Row] = []
    row: Row
    post: dict[str, str | int | None] = {}
    try:
        with db_con:
            db_cur = db_con.cursor()
            db_cur.row_factory = cast(Callable[[Cursor, Row], Row], Row)
            db_cur.execute(sql, parameters)
            # TODO(wathne): For safety, limit this to 1 iteration.
            for db_cur_row in db_cur:
                rows.append(db_cur_row)
    except AnySqlite3Error as err:
        print(err)
        print("Database: Post retrieval failed.")
        return None
    else:
        if not rows:
            print("Database: List of retrieved rows is empty.")
            print("Database: Post retrieval failed.")
            return None
        row = rows[0]
        if row["image_id"] is None:
            post["image_id"] = None
            print("Database: image_id = None.")
        else:
            try:
                post["image_id"] = int(row["image_id"])
            except (TypeError, ValueError) as int_error:
                print(int_error)
                post["image_id"] = None
                print("Database: image_id = None, as fallback.")
        try:
            post["post_id"] = int(row["post_id"])
        except (TypeError, ValueError) as int_error:
            print(int_error)
            print("Database: Post retrieval failed.")
            return None
        try:
            post["post_last_modified"] = int(row["post_last_modified"])
        except (TypeError, ValueError) as int_error:
            print(int_error)
            post["post_last_modified"] = 0
            print("Database: post_last_modified = 0, Unix time, as fallback.")
        post["post_text"] = str(row["post_text"])
        try:
            post["post_timestamp"] = int(row["post_timestamp"])
        except (TypeError, ValueError) as int_error:
            print(int_error)
            post["post_timestamp"] = 0
            print("Database: post_timestamp = 0, Unix time, as fallback.")
        try:
            post["thread_id"] = int(row["thread_id"])
        except (TypeError, ValueError) as int_error:
            print(int_error)
            print("Database: Post retrieval failed.")
            return None
        try:
            post["user_id"] = int(row["user_id"])
        except (TypeError, ValueError) as int_error:
            print(int_error)
            print("Database: Post retrieval failed.")
            return None
        print("Database: Post retrieval completed successfully.")
        return post
    finally:
        # The finally clause is always executed on the way out.
        db_cur.close()


def retrieve_posts(
    db_con: Connection,
    thread_id: int,
) -> list[dict[str, str | int | None]] | None:
    print("Database: Retrieving posts ...")
    sql: str = (
        "SELECT "
            "image_id, "
            "post_id, "
            "post_last_modified, "
            "post_text, "
            "post_timestamp, "
            "thread_id, "
            "user_id"
        " FROM posts WHERE thread_id = :thread_id;"
    )
    parameters: dict[str, int] = {
        "thread_id": thread_id,
    }
    db_cur: Cursor
    db_cur_row: Row
    rows: list[Row] = []
    row: Row
    posts: list[dict[str, str | int | None]] = []
    post: dict[str, str | int | None] = {}
    try:
        with db_con:
            db_cur = db_con.cursor()
            db_cur.row_factory = cast(Callable[[Cursor, Row], Row], Row)
            db_cur.execute(sql, parameters)
            for db_cur_row in db_cur:
                rows.append(db_cur_row)
    except AnySqlite3Error as err:
        print(err)
        print("Database: Posts retrieval failed.")
        return None
    else:
        if not rows:
            print("Database: List of retrieved rows is empty.")
            print("Database: Posts retrieval failed.")
            return None
        for row in rows:
            post = {}
            if row["image_id"] is None:
                post["image_id"] = None
                print("Database: image_id = None.")
            else:
                try:
                    post["image_id"] = int(row["image_id"])
                except (TypeError, ValueError) as int_error:
                    print(int_error)
                    post["image_id"] = None
                    print("Database: image_id = None, as fallback.")
            try:
                post["post_id"] = int(row["post_id"])
            except (TypeError, ValueError) as int_error:
                print(int_error)
                print("Database: Post retrieval failed. Skipping post.")
                continue
            try:
                post["post_last_modified"] = int(row["post_last_modified"])
            except (TypeError, ValueError) as int_error:
                print(int_error)
                post["post_last_modified"] = 0
                print("Database: post_last_modified = 0, Unix time, as "
                      "fallback.")
            post["post_text"] = str(row["post_text"])
            try:
                post["post_timestamp"] = int(row["post_timestamp"])
            except (TypeError, ValueError) as int_error:
                print(int_error)
                post["post_timestamp"] = 0
                print("Database: post_timestamp = 0, Unix time, as fallback.")
            try:
                post["thread_id"] = int(row["thread_id"])
            except (TypeError, ValueError) as int_error:
                print(int_error)
                print("Database: Post retrieval failed. Skipping post.")
                continue
            try:
                post["user_id"] = int(row["user_id"])
            except (TypeError, ValueError) as int_error:
                print(int_error)
                print("Database: Post retrieval failed. Skipping post.")
                continue
            posts.append(post)
        if not posts:
            print("Database: List of retrieved posts is empty.")
            print("Database: Posts retrieval failed.")
            return None
        print("Database: Posts retrieval completed successfully.")
        return posts
    finally:
        # The finally clause is always executed on the way out.
        db_cur.close()


def _create_users_table(db_con: Connection) -> bool:
    print("Database: Creating 'users' table ...")
    sql: str = (
        "CREATE TABLE users ("
            "user_group INTEGER NOT NULL, "
            "user_id INTEGER, "
            "user_name TEXT NOT NULL, "
            "user_password_hash TEXT NOT NULL, "
            "user_timestamp INTEGER NOT NULL, "
            "PRIMARY KEY (user_id), "
            "UNIQUE (user_name)"
        ");"
    )
    db_cur: Cursor
    try:
        # The Connection context manager will commit the transaction.
        with db_con:
            db_cur = db_con.cursor()
            db_cur.execute(sql)
    except AnySqlite3Error as err:
        print(err)
        print("Database: 'users' table creation failed.")
        return False
    else:
        print("Database: 'users' table created.")
        return True
    finally:
        # The finally clause is always executed on the way out.
        db_cur.close()


def _create_images_table(db_con: Connection) -> bool:
    print("Database: Creating 'images' table ...")
    sql: str = (
        "CREATE TABLE images ("
            "image_file_extension TEXT NOT NULL, "
            "image_file_name TEXT NOT NULL, "
            "image_id INTEGER, "
            "image_timestamp INTEGER NOT NULL, "
            "user_id INTEGER NOT NULL, "
            "PRIMARY KEY (image_id), "
            "FOREIGN KEY (user_id) REFERENCES users (user_id)"
        ");"
    )
    db_cur: Cursor
    try:
        # The Connection context manager will commit the transaction.
        with db_con:
            db_cur = db_con.cursor()
            db_cur.execute(sql)
    except AnySqlite3Error as err:
        print(err)
        print("Database: 'images' table creation failed.")
        return False
    else:
        print("Database: 'images' table created.")
        return True
    finally:
        # The finally clause is always executed on the way out.
        db_cur.close()


def _create_threads_table(db_con: Connection) -> bool:
    print("Database: Creating 'threads' table ...")
    sql: str = (
        "CREATE TABLE threads ("
            "post_id INTEGER, "
            "thread_id INTEGER, "
            "thread_last_modified INTEGER NOT NULL, "
            "thread_subject TEXT NOT NULL, "
            "thread_timestamp INTEGER NOT NULL, "
            "user_id INTEGER NOT NULL, "
            "FOREIGN KEY (post_id) REFERENCES posts (post_id), "
            "PRIMARY KEY (thread_id), "
            "FOREIGN KEY (user_id) REFERENCES users (user_id)"
        ");"
    )
    db_cur: Cursor
    try:
        # The Connection context manager will commit the transaction.
        with db_con:
            db_cur = db_con.cursor()
            db_cur.execute(sql)
    except AnySqlite3Error as err:
        print(err)
        print("Database: 'threads' table creation failed.")
        return False
    else:
        print("Database: 'threads' table created.")
        return True
    finally:
        # The finally clause is always executed on the way out.
        db_cur.close()


def _create_posts_table(db_con: Connection) -> bool:
    print("Database: Creating 'posts' table ...")
    sql: str = (
        "CREATE TABLE posts ("
            "image_id INTEGER, "
            "post_id INTEGER, "
            "post_last_modified INTEGER NOT NULL, "
            "post_text TEXT NOT NULL, "
            "post_timestamp INTEGER NOT NULL, "
            "thread_id INTEGER NOT NULL, "
            "user_id INTEGER NOT NULL, "
            "FOREIGN KEY (image_id) REFERENCES images (image_id), "
            "PRIMARY KEY (post_id), "
            "FOREIGN KEY (thread_id) REFERENCES threads (thread_id), "
            "FOREIGN KEY (user_id) REFERENCES users (user_id)"
        ");"
    )
    db_cur: Cursor
    try:
        # The Connection context manager will commit the transaction.
        with db_con:
            db_cur = db_con.cursor()
            db_cur.execute(sql)
    except AnySqlite3Error as err:
        print(err)
        print("Database: 'posts' table creation failed.")
        return False
    else:
        print("Database: 'posts' table created.")
        return True
    finally:
        # The finally clause is always executed on the way out.
        db_cur.close()


def _setup_database(database_path: str = r"./database.db") -> bool:
    print(f"Database: Connecting to '{database_path}' ...")
    db_con: Connection
    try:
        db_con = connect(database=database_path)
    except AnySqlite3Error as err:
        print(err)
        print("Database: Connection failed.")
        return False
    else:
        print("Database: Connection opened.")
        if not _create_users_table(db_con=db_con):
            print("Database: Setup failed.")
            return False
        if not _create_images_table(db_con=db_con):
            print("Database: Setup failed.")
            return False
        if not _create_threads_table(db_con=db_con):
            print("Database: Setup failed.")
            return False
        if not _create_posts_table(db_con=db_con):
            print("Database: Setup failed.")
            return False
        print("Database: Setup completed successfully.")
        return True
    finally:
        # The finally clause is always executed on the way out.
        db_con.close()
        print("Database: Connection closed.")


if __name__ == "__main__":
    pass

