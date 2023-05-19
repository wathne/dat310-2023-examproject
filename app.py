"""Flask app.

The REST API is stateless. No server side session data will survive a
Flask request context. The session API will let the client set the
session username and password in a signed cookie. The client will then
return this signed cookie under the Cookie HTTP request header. A
load_user() function is called before each request and the credentials
provided by the signed cookie are used to authenticate a user_id. An
authenticated state/user_id is lost when the request context is popped.

WIP: The session API and REST API is work in progress and may change.
WIP: Database table specifications are work in progress and may change.


Session API:
    /api/login
        [POST]
            body:     json[dict[str, str]]
            response: json[int] | json[None]

    /api/logout
        [POST]
            body:     Any
            response: json[int] | json[None]

    /api/register
        [POST]   (Create user.)(Alias for /api/users [POST], see REST API.)
            body:     json[dict[str, str]]
            response: json[int] | json[None]


REST API:
    /api/images
        [GET]    (List images.)(Not implemented.)
        [POST]   (Upload image and also create thumbnail.)

    /api/images/<image_id>
        [GET]    (Retrieve image.)
        [DELETE] (Delete image and also delete thumbnail.)(Not implemented.)

    /api/thumbnails
        [GET]    (List thumbnails.)(Not implemented.)

    /api/thumbnails/<image_id>
        [GET]    (Retrieve thumbnail.)

    /api/threads
        [GET]    (List threads.)
        [POST]   (Create thread and also create top post.)

    /api/threads/<thread_id>
        [GET]    (Retrieve thread and posts.)
        [PUT]    (Update thread.)(Not implemented.)
        [POST]   (Create post.)
        [DELETE] (Delete thread.)(Not implemented.)

    /api/threads/<thread_id>/images
        [GET]    (List images.)(Not implemented.)

    /api/threads/<thread_id>/thumbnails
        [GET]    (List thumbnails.)(Not implemented.)

    /api/threads/<thread_id>/posts
        [GET]    (List posts.)
        [POST]   (Create post.)

    /api/posts
        [GET]    (List posts.)(Not implemented.)

    /api/posts/<post_id>
        [GET]    (Retrieve post.)
        [PUT]    (Update post.)(Not implemented.)
        [DELETE] (Delete post.)(Not implemented.)

    /api/users
        [GET]    (List users.)(Not implemented.)
        [POST]   (Create user.)(See session API.)

    /api/users/<user_id>
        [GET]    (Retrieve user.)(Not implemented.)
        [PUT]    (Update user.)(Not implemented.)
        [DELETE] (Delete user.)(Not implemented.)

    /api/users/<user_id>/images

    /api/users/<user_id>/images/<image_id>

    /api/users/<user_id>/thumbnails

    /api/users/<user_id>/thumbnails/<image_id>

    /api/users/<user_id>/threads

    /api/users/<user_id>/threads/<thread_id>

    /api/users/<user_id>/posts

    /api/users/<user_id>/posts/<post_id>


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
    (image_file_name is UNIQUE)
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


TODO(wathne):
    /api/images
        [POST]   (Upload image and also create thumbnail.)

    /api/images/<image_id>
        [GET]    (Retrieve image.)

    /api/thumbnails/<image_id>
        [GET]    (Retrieve thumbnail.)
"""

#from database_handler import insert_image
from database_handler import insert_post
from database_handler import insert_thread
from database_handler import insert_user
#from database_handler import retrieve_image
from database_handler import retrieve_post
from database_handler import retrieve_posts
from database_handler import retrieve_thread
from database_handler import retrieve_threads
#from database_handler import retrieve_user_by_id
from database_handler import retrieve_user_by_name
#from flask import current_app # current_app is a LocalProxy.
from flask import Flask # current_app real type.
from flask import g # g is a LocalProxy.
from flask import redirect
from flask import render_template
from flask import request # request is a LocalProxy.
from flask import session # session is a LocalProxy.
from flask import url_for
from flask.ctx import _AppCtxGlobals as ACG # g real type.
from flask.json import jsonify
from flask.sessions import SecureCookieSession as SCS # session real type.
from flask.wrappers import Request # request real type.
from flask.wrappers import Response
from sqlite3 import connect
from sqlite3 import Connection
from sqlite3 import Error as AnySqlite3Error
from typing import cast
from werkzeug.local import LocalProxy as LP
from werkzeug.security import check_password_hash
from werkzeug.security import generate_password_hash
from werkzeug.wrappers.response import Response as WerkzeugResponse


_database_path: str = r"./database.db"
_images_path: str = r"./images/"
app: Flask = Flask(import_name=__name__)
app.secret_key = "91d754bc1945369164b3b5d288ee41d3"


def get_database_connection() -> Connection | None:
    # pylint: disable=protected-access
    acg: ACG = cast(LP[ACG], g)._get_current_object()
    db_con_id: int | None = None
    if "db_con" not in acg:
        print(f"Database: Connecting to '{_database_path}' ...")
        try:
            acg.db_con = connect(database=_database_path)
        except AnySqlite3Error as connect_error:
            print(connect_error)
            print("Database: Connection failed (ID: None).")
            return None
        else:
            db_con_id = id(acg.db_con)
            print(f"Database: Connection opened (ID: {db_con_id}).")
            return acg.db_con

    # During an application context, for any repeated calls to
    # get_database_connection(), we may want to ensure that the database
    # connection is still alive.
    db_con_id = id(acg.db_con)
    try:
        # Attempt to open and close a database cursor.
        acg.db_con.cursor().close()
    except AnySqlite3Error as cursor_error:
        print(cursor_error)
        print(f"Database: Connection failed (ID: {db_con_id}).")
        db_con_id = None
        print(f"Database: Reconnecting to '{_database_path}' ...")
        try:
            acg.db_con = connect(database=_database_path)
        except AnySqlite3Error as reconnect_error:
            print(reconnect_error)
            print("Database: Reconnection failed (ID: None).")
            return None
        else:
            db_con_id = id(acg.db_con)
            print(f"Database: Connection opened (ID: {db_con_id}).")
            return acg.db_con
    else:
        print(f"Database: Connection is still alive (ID: {db_con_id}).")
        return cast(Connection, acg.db_con)


@app.teardown_appcontext
def teardown_database_connection(exc: BaseException | None = None) -> None:
    # pylint: disable=protected-access
    acg: ACG = cast(LP[ACG], g)._get_current_object()
    db_con_id: int | None = None
    if exc is not None:
        print(exc)
        pass
    if "db_con" in acg:
        db_con_id = id(acg.db_con)
        acg.db_con.close()
        print(f"Database: Connection closed (ID: {db_con_id}).")


def load_user() -> None:
    print("Calling load_user().")
    # pylint: disable=protected-access
    acg: ACG = cast(LP[ACG], g)._get_current_object()
    acg.user_group = None
    acg.user_id = None
    acg.user_name = None

    scs: SCS = cast(LP[SCS], session)._get_current_object()
    scs_username: str | None = scs.get(key="username", default=None)
    scs_password: str | None = scs.get(key="password", default=None)
    if scs_username is None:
        return None
    if scs_password is None:
        return None

    db_con: Connection | None = get_database_connection()
    if db_con is None:
        return None

    user: dict[str, str | int] | None
    user_group: int | None
    user_id: int | None
    user_name: str | None
    user_password_hash: str | None
    user = retrieve_user_by_name(db_con=db_con, user_name=scs_username)
    if user is None:
        return None
    user_group = cast(int | None, user.get("user_group", None))
    user_id = cast(int | None, user.get("user_id", None))
    user_name = cast(str | None, user.get("user_name", None))
    user_password_hash = cast(str | None, user.get("user_password_hash", None))
    if user_group is None:
        return None
    if user_id is None:
        return None
    if user_name is None:
        return None
    if user_password_hash is None:
        return None

    if check_password_hash(
        pwhash=user_password_hash,
        password=scs_password,
    ):
        acg.user_group = user_group
        acg.user_id = user_id
        acg.user_name = user_name
    return None


@app.before_request
def before_request() -> None:
    # pylint: disable=protected-access
    request_: Request = cast(LP[Request], request)._get_current_object()
    db_con: Connection | None = get_database_connection()

    # Do not call load_user() if endpoint is whitelisted.
    endpoint_whitelist: set[str] = {
        "index", # Authentication is not required.
        "api_login", # api_login() will call load_user().
        "_tests_login_deprecated", # login_deprecated() will call load_user().
        "api_users", # api_users() will call load_user().
        #"static", # See path_whitelist below.
    }
    if request_.endpoint in endpoint_whitelist:
        print(f"{request_.endpoint} is whitelisted, bypassing load_user().")
        return None

    # Do not call load_user() if path is whitelisted.
    path_whitelist: set[str] = {
        "/static/index.html", # Authentication is not required.
        "/static/script.js", # Authentication is not required.
        "/static/style.css", # Authentication is not required.
        "/static/tests/index.html", # Authentication is not required.
        "/static/tests/script.js", # Authentication is not required.
        "/static/tests/style.css", # Authentication is not required.
    }
    if request_.path in path_whitelist:
        print(f"{request_.path} is whitelisted, bypassing load_user().")
        return None

    if db_con is None:
        return None

    load_user()
    return None


@app.route(rule="/")
@app.route(rule="/index")
def index() -> WerkzeugResponse | Response:
    # See before_request(), endpoint_whitelist.
    # index() is whitelisted.
    return redirect(
        location=url_for(
            endpoint="static",
            filename="index.html",
        ),
        code=302,
    )


# Obsolete or testing, please ignore.
@app.route(rule="/tests/user_info")
def _tests_user_info() -> tuple[str, int]:
    # pylint: disable=protected-access
    scs: SCS = cast(LP[SCS], session)._get_current_object()
    scs_username: str | None = scs.get(key="username", default=None)
    scs_password: str | None = scs.get(key="password", default=None)
    return (render_template(
        template_name_or_list="tests/user_info.html",
        username=scs_username,
        password=scs_password,
    ), 200)


# Obsolete or testing, please ignore.
@app.route(rule="/tests/clear_user")
def _tests_clear_user() -> WerkzeugResponse | Response:
    # pylint: disable=protected-access
    scs: SCS = cast(LP[SCS], session)._get_current_object()
    scs.pop(key="username", default=None)
    scs.pop(key="password", default=None)
    return redirect(
        location=url_for(
            endpoint="_tests_user_info",
        ),
        code=302,
    )


# Obsolete or testing, please ignore.
@app.route(rule="/tests/session_info")
def _tests_session_info() -> tuple[str, int]:
    # pylint: disable=protected-access
    scs: SCS = cast(LP[SCS], session)._get_current_object()
    return (render_template(
        template_name_or_list="tests/session_info.html",
        scs=scs,
    ), 200)


# Obsolete or testing, please ignore.
@app.route(rule="/tests/clear_session")
def _tests_clear_session() -> WerkzeugResponse | Response:
    # pylint: disable=protected-access
    scs: SCS = cast(LP[SCS], session)._get_current_object()
    scs.clear()
    return redirect(
        location=url_for(
            endpoint="_tests_session_info",
        ),
        code=302,
    )


# Obsolete or testing, please ignore.
@app.route(rule="/tests/")
@app.route(rule="/tests/index")
def _tests_index() -> tuple[str, int]:
    return (render_template(
        template_name_or_list="tests/index.html",
    ), 200)


# Obsolete or testing, please ignore.
@app.route(rule="/tests/api")
def _tests_api() -> tuple[str, int]:
    return (render_template(
        template_name_or_list="tests/api.html",
    ), 200)


# Obsolete or testing, please ignore.
@app.route(
    rule="/tests/login_deprecated",
    methods=["GET", "POST"],
)
def _tests_login_deprecated() -> tuple[str, int]:
    # pylint: disable=protected-access
    acg: ACG = cast(LP[ACG], g)._get_current_object()
    request_: Request = cast(LP[Request], request)._get_current_object()
    scs: SCS = cast(LP[SCS], session)._get_current_object()
    db_con: Connection | None = get_database_connection()

    if request_.method == "POST":
        scs["username"] = request_.form.get(
            key="username",
            default=None,
            type=str,
        )
        scs["password"] = request_.form.get(
            key="password",
            default=None,
            type=str,
        )

        if db_con is None:
            return ("No database connection.", 500)

        # See before_request(), endpoint_whitelist.
        # login_deprecated() is whitelisted. We need to call load_user().
        load_user()
        if acg.user_id is None:
            return (render_template(
                template_name_or_list="tests/form_login_error.html",
            ), 200)

        return (render_template(
            template_name_or_list="tests/form_login_success.html",
        ), 200)

    return (render_template(
        template_name_or_list="tests/form_login.html",
    ), 200)


@app.route(
    rule="/api/login",
    methods=["POST"],
)
def api_login() -> Response:
    # pylint: disable=protected-access
    acg: ACG = cast(LP[ACG], g)._get_current_object()
    request_: Request = cast(LP[Request], request)._get_current_object()
    scs: SCS = cast(LP[SCS], session)._get_current_object()
    db_con: Connection | None = get_database_connection()

    request_dict: dict[str, str | None] | None = None
    request_dict_username: str | None = None
    request_dict_password: str | None = None
    if request_.is_json:
        request_dict = request_.get_json(force=False, silent=True, cache=False)
    if isinstance(request_dict, dict):
        request_dict_username = request_dict.get("username", None)
        request_dict_password = request_dict.get("password", None)
    if request_dict_username is None:
        return jsonify(None)
    if request_dict_password is None:
        return jsonify(None)

    scs["username"] = request_dict_username
    scs["password"] = request_dict_password

    if db_con is None:
        return jsonify(None)

    # See before_request(), endpoint_whitelist.
    # api_login() is whitelisted. We need to call load_user().
    load_user()
    print(f"Login as user_id: {acg.user_id}.")
    if acg.user_id is None:
        return jsonify(None)
    return jsonify(acg.user_id)


@app.route(
    rule="/api/logout",
    methods=["POST"],
)
def api_logout() -> Response:
    # pylint: disable=protected-access
    acg: ACG = cast(LP[ACG], g)._get_current_object()
    scs: SCS = cast(LP[SCS], session)._get_current_object()
    scs.pop(key="username", default=None)
    scs.pop(key="password", default=None)

    print(f"Logout as user_id: {acg.user_id}.")
    if acg.user_id is None:
        return jsonify(None)
    return jsonify(acg.user_id)


@app.route(
    rule="/api/register",
    methods=["POST"],
)
@app.route(
    rule="/api/users",
    methods=["POST"],
)
def api_users() -> Response:
    # pylint: disable=protected-access
    acg: ACG = cast(LP[ACG], g)._get_current_object()
    request_: Request = cast(LP[Request], request)._get_current_object()
    scs: SCS = cast(LP[SCS], session)._get_current_object()
    db_con: Connection | None = get_database_connection()

    request_dict: dict[str, str | None] | None = None
    request_dict_username: str | None = None
    request_dict_password: str | None = None
    if request_.is_json:
        request_dict = request_.get_json(force=False, silent=True, cache=False)
    if isinstance(request_dict, dict):
        request_dict_username = request_dict.get("username", None)
        request_dict_password = request_dict.get("password", None)
    if request_dict_username is None:
        return jsonify(None)
    if request_dict_password is None:
        return jsonify(None)

    if db_con is None:
        return jsonify(None)

    # Create user.
    user_id: int
    user_id = insert_user(
        db_con=db_con,
        user_name=request_dict_username,
        user_password_hash=generate_password_hash(
            password=request_dict_password,
        ),
        user_group=None,
    )
    # TODO(wathne): Return something.
    if user_id == -1:
        print("user_id is -1, return None.")
        return jsonify(None)
    # user_name already exists.
    if user_id == -2:
        print("user_id is -2, return None.")
        return jsonify(None)

    scs["username"] = request_dict_username
    scs["password"] = request_dict_password

    # See before_request(), endpoint_whitelist.
    # api_users() is whitelisted. We need to call load_user().
    load_user()
    print(f"Login as user_id: {acg.user_id}.")
    if acg.user_id is None:
        return jsonify(None)
    return jsonify(acg.user_id)


@app.route(
    rule="/api/threads",
    methods=["GET","POST"],
)
def api_threads() -> Response:
    # pylint: disable=protected-access
    acg: ACG = cast(LP[ACG], g)._get_current_object()
    request_: Request = cast(LP[Request], request)._get_current_object()
    db_con: Connection | None = get_database_connection()

    print(f"/api/threads [{request_.method}] "
          f"as user_id: {acg.user_id}")

    request_dict: dict[str, str | int | None] | None = None
    request_dict_image_id: int | None = None
    request_dict_post_text: str | None = None
    request_dict_thread_subject: str | None = None
    if request_.is_json:
        request_dict = request_.get_json(force=False, silent=True, cache=False)
    if isinstance(request_dict, dict):
        request_dict_image_id = cast(int | None,
            request_dict.get("image_id", None),
        )
        request_dict_post_text = cast(str | None,
            request_dict.get("post_text", None),
        )
        request_dict_thread_subject = cast(str | None,
            request_dict.get("thread_subject", None),
        )

    if acg.user_id is None:
        return jsonify(None)

    if db_con is None:
        return jsonify(None)

    thread_id: int
    threads_: list[dict[str, str | int | None]] | None

    # List threads.
    if request_.method == "GET":
        threads_ = retrieve_threads(
            db_con=db_con,
        )
        if threads_ is None:
            return jsonify(None)
        return jsonify(threads_)

    # Create thread and also create top post.
    if request_.method == "POST":
        if request_dict_thread_subject is None:
            return jsonify(None)
        thread_id = insert_thread(
            db_con=db_con,
            user_id=acg.user_id,
            thread_subject=request_dict_thread_subject,
            post_text=request_dict_post_text,
            image_id=request_dict_image_id,
        )
        # TODO(wathne): Return something.
        if thread_id == -1:
            print("thread_id is -1, return None.")
            return jsonify(None)
        return jsonify(thread_id)

    return jsonify(None)


# TODO(wathne): Combine api_thread() and api_thread_posts(). Check request path.
@app.route(
    rule="/api/threads/<int:thread_id>",
    methods=["GET","POST"],
)
def api_thread(thread_id: int | None = None) -> Response:
    # pylint: disable=protected-access
    acg: ACG = cast(LP[ACG], g)._get_current_object()
    request_: Request = cast(LP[Request], request)._get_current_object()
    db_con: Connection | None = get_database_connection()

    print(f"/api/threads/{thread_id} [{request_.method}] "
          f"as user_id: {acg.user_id}")

    if thread_id is None:
        return jsonify(None)

    request_dict: dict[str, str | int | None] | None = None
    request_dict_image_id: int | None = None
    request_dict_post_text: str | None = None
    if request_.is_json:
        request_dict = request_.get_json(force=False, silent=True, cache=False)
    if isinstance(request_dict, dict):
        request_dict_image_id = cast(int | None,
            request_dict.get("image_id", None),
        )
        request_dict_post_text = cast(str | None,
            request_dict.get("post_text", None),
        )

    if acg.user_id is None:
        return jsonify(None)

    if db_con is None:
        return jsonify(None)

    post_id: int
    thread_: dict[str, str | int | None] | None
    posts: list[dict[str, str | int | None]] | None
    thread_and_posts: dict[str,
        dict[str, str | int | None] |
        list[dict[str, str | int | None]]
    ] = {}

    # Retrieve thread and posts.
    if request_.method == "GET":
        thread_ = retrieve_thread(
            db_con=db_con,
            thread_id=thread_id,
        )
        if thread_ is None:
            return jsonify(None)
        posts = retrieve_posts(
            db_con=db_con,
            thread_id=thread_id,
        )
        if posts is None:
            return jsonify(None)
        thread_and_posts["thread"] = thread_
        thread_and_posts["posts"] = posts
        return jsonify(thread_and_posts)

    # Create post.
    if request_.method == "POST":
        post_id = insert_post(
            db_con=db_con,
            user_id=acg.user_id,
            thread_id=thread_id,
            post_text=request_dict_post_text,
            image_id=request_dict_image_id,
        )
        # TODO(wathne): Return something.
        if post_id == -1:
            print("post_id is -1, return None.")
            return jsonify(None)
        return jsonify(post_id)

    return jsonify(None)


# TODO(wathne): Combine api_thread() and api_thread_posts(). Check request path.
@app.route(
    rule="/api/threads/<int:thread_id>/posts",
    methods=["GET","POST"],
)
def api_thread_posts(thread_id: int | None = None) -> Response:
    # pylint: disable=protected-access
    acg: ACG = cast(LP[ACG], g)._get_current_object()
    request_: Request = cast(LP[Request], request)._get_current_object()
    db_con: Connection | None = get_database_connection()

    print(f"/api/threads/{thread_id}/posts [{request_.method}] "
          f"as user_id: {acg.user_id}")

    if thread_id is None:
        return jsonify(None)

    request_dict: dict[str, str | int | None] | None = None
    request_dict_image_id: int | None = None
    request_dict_post_text: str | None = None
    if request_.is_json:
        request_dict = request_.get_json(force=False, silent=True, cache=False)
    if isinstance(request_dict, dict):
        request_dict_image_id = cast(int | None,
            request_dict.get("image_id", None),
        )
        request_dict_post_text = cast(str | None,
            request_dict.get("post_text", None),
        )

    if acg.user_id is None:
        return jsonify(None)

    if db_con is None:
        return jsonify(None)

    post_id: int
    posts: list[dict[str, str | int | None]] | None

    # List posts.
    if request_.method == "GET":
        posts = retrieve_posts(
            db_con=db_con,
            thread_id=thread_id,
        )
        if posts is None:
            return jsonify(None)
        return jsonify(posts)

    # Create post.
    if request_.method == "POST":
        post_id = insert_post(
            db_con=db_con,
            user_id=acg.user_id,
            thread_id=thread_id,
            post_text=request_dict_post_text,
            image_id=request_dict_image_id,
        )
        # TODO(wathne): Return something.
        if post_id == -1:
            print("post_id is -1, return None.")
            return jsonify(None)
        return jsonify(post_id)

    return jsonify(None)


@app.route(
    rule="/api/posts/<int:post_id>",
    methods=["GET"],
)
def api_post(post_id: int | None = None) -> Response:
    # pylint: disable=protected-access
    acg: ACG = cast(LP[ACG], g)._get_current_object()
    request_: Request = cast(LP[Request], request)._get_current_object()
    db_con: Connection | None = get_database_connection()

    print(f"/api/posts/{post_id} [{request_.method}] "
          f"as user_id: {acg.user_id}")

    if post_id is None:
        return jsonify(None)

    if acg.user_id is None:
        return jsonify(None)

    if db_con is None:
        return jsonify(None)

    # Retrieve post.
    post: dict[str, str | int | None] | None
    post = retrieve_post(
        db_con=db_con,
        post_id=post_id,
    )
    if post is None:
        return jsonify(None)
    return jsonify(post)


if __name__ == "__main__":
    app.run(debug=True)

