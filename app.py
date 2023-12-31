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

    /api/cookie/settings
        [GET]    (Get SecureCookieSession["settings"] as json.)
            body:     N/A
            response: json[Any] | json[None]
        [POST]   (Set SecureCookieSession["settings"] as json.)
            body:     json[Any]
            response: json[Any] | json[None]


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
        [PUT]    (Update thread.)
        [POST]   (Create post.)
        [DELETE] (Delete thread.)

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
        [PUT]    (Update post.)
        [DELETE] (Delete post.)

    /api/users
        [GET]    (List users.)(Not implemented.)
        [POST]   (Create user.)(See session API.)

    /api/users/<user_id>
        [GET]    (Retrieve user.)
        [PUT]    (Update user.)(Not implemented.)
        [DELETE] (Delete user.)(Not implemented.)

    /api/users/<user_id>/images (Not implemented.)

    /api/users/<user_id>/images/<image_id> (Not implemented.)

    /api/users/<user_id>/thumbnails (Not implemented.)

    /api/users/<user_id>/thumbnails/<image_id> (Not implemented.)

    /api/users/<user_id>/threads (Not implemented.)

    /api/users/<user_id>/threads/<thread_id> (Not implemented.)

    /api/users/<user_id>/posts (Not implemented.)

    /api/users/<user_id>/posts/<post_id> (Not implemented.)


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


TODO(wathne):
    /api/images
        [POST]   (Upload image and also create thumbnail.)

    /api/thumbnails/<image_id>
        [GET]    (Retrieve thumbnail.)
"""


from database_handler import delete_post
from database_handler import delete_thread
from database_handler import insert_image
from database_handler import insert_post
from database_handler import insert_thread
from database_handler import insert_user
from database_handler import retrieve_image
from database_handler import retrieve_post
from database_handler import retrieve_posts
from database_handler import retrieve_thread
from database_handler import retrieve_threads
from database_handler import retrieve_user_by_id
from database_handler import retrieve_user_by_name
from database_handler import update_post
from database_handler import update_thread
#from flask import current_app # current_app is a LocalProxy.
from flask import Flask # current_app real type.
from flask import g # g is a LocalProxy.
from flask import redirect
from flask import request # request is a LocalProxy.
from flask import send_from_directory
from flask import session # session is a LocalProxy.
from flask import url_for
from flask.ctx import _AppCtxGlobals as ACG # g real type.
from flask.json import jsonify
from flask.sessions import SecureCookieSession as SCS # session real type.
from flask.wrappers import Request # request real type.
from flask.wrappers import Response
from os.path import isfile as os_isfile
from os.path import join as os_join
from pathlib import Path
from sqlite3 import connect
from sqlite3 import Connection
from sqlite3 import Error as AnySqlite3Error
from typing import cast
from werkzeug.datastructures import FileStorage
from werkzeug.exceptions import BadRequest # 400
from werkzeug.exceptions import Unauthorized # 401
from werkzeug.exceptions import Forbidden # 403
from werkzeug.exceptions import NotFound # 404
from werkzeug.exceptions import MethodNotAllowed # 405
from werkzeug.exceptions import Conflict # 409
from werkzeug.exceptions import Gone # 410
from werkzeug.exceptions import RequestEntityTooLarge # 413
from werkzeug.exceptions import UnsupportedMediaType # 415
from werkzeug.exceptions import InternalServerError # 500
from werkzeug.local import LocalProxy as LP
from werkzeug.security import check_password_hash
from werkzeug.security import generate_password_hash
from werkzeug.utils import secure_filename
from werkzeug.wrappers.response import Response as WerkzeugResponse


DATABASE_PATH: str = r"./database.db"
IMAGES_FOLDER: str = r"./images"
IMAGES_EXTENSIONS: set[str] = {".gif", ".jpeg", ".jpg", ".png"}
app: Flask = Flask(import_name=__name__)
# Flask will raise a RequestEntityTooLarge exception.
app.config["MAX_CONTENT_LENGTH"] = 16 * 1000 * 1000 # 16 megabytes.
app.secret_key = "91d754bc1945369164b3b5d288ee41d3"


def get_database_connection() -> Connection | None:
    # pylint: disable=protected-access
    acg: ACG = cast(LP[ACG], g)._get_current_object()
    db_con_id: int | None = None
    if "db_con" not in acg:
        print(f"Database: Connecting to '{DATABASE_PATH}' ...")
        try:
            acg.db_con = connect(database=DATABASE_PATH)
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
        print(f"Database: Reconnecting to '{DATABASE_PATH}' ...")
        try:
            acg.db_con = connect(database=DATABASE_PATH)
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
        "api_cookie_settings", # Authentication is not required.
        "api_login", # api_login() will call load_user().
        "api_users", # api_users() will call load_user().
        "favicon", # Authentication is not required.
        "imageboard", # Authentication is not required.
        "index", # Authentication is not required.
        #"static", # See path_whitelist below.
    }
    if request_.endpoint in endpoint_whitelist:
        print(f"{request_.endpoint} is whitelisted, bypassing load_user().")
        return None

    # Do not call load_user() if path is whitelisted.
    path_whitelist: set[str] = {
        "/static/api.js", # Authentication is not required.
        "/static/box.js", # Authentication is not required.
        "/static/favicon.ico", # Authentication is not required.
        "/static/form-validation.js", # Authentication is not required.
        "/static/handler.js", # Authentication is not required.
        "/static/imageboard.css", # Authentication is not required.
        "/static/imageboard.html", # Authentication is not required.
        "/static/imageboard.js", # Authentication is not required.
    }
    if request_.path in path_whitelist:
        print(f"{request_.path} is whitelisted, bypassing load_user().")
        return None

    if db_con is None:
        return None

    load_user()
    return None


# Raise if the browser sends something to the application the application or
# server cannot handle.
# https://werkzeug.palletsprojects.com/en/2.3.x/exceptions/#werkzeug.exceptions.BadRequest
@app.errorhandler(BadRequest)
def handle_bad_request(e: BadRequest) -> Response:
    code: int = e.code
    name: str = e.name
    description: str = e.description
    response: Response = jsonify({
        "code": code,
        "name": name,
        "description": description,
    })
    response.status_code = code
    return response


# Raise if the user is not authorized to access a resource.
# https://werkzeug.palletsprojects.com/en/2.3.x/exceptions/#werkzeug.exceptions.Unauthorized
@app.errorhandler(Unauthorized)
def handle_unauthorized(e: Unauthorized) -> Response:
    code: int = e.code
    name: str = e.name
    description: str = e.description
    response: Response = jsonify({
        "code": code,
        "name": name,
        "description": description,
    })
    response.status_code = code
    return response

# Raise if the user doesn’t have the permission for the requested resource but
# was authenticated.
# https://werkzeug.palletsprojects.com/en/2.3.x/exceptions/#werkzeug.exceptions.Forbidden
@app.errorhandler(Forbidden)
def handle_forbidden(e: Forbidden) -> Response:
    code: int = e.code
    name: str = e.name
    description: str = e.description
    response: Response = jsonify({
        "code": code,
        "name": name,
        "description": description,
    })
    response.status_code = code
    return response


# Raise if a resource does not exist and never existed.
# https://werkzeug.palletsprojects.com/en/2.3.x/exceptions/#werkzeug.exceptions.NotFound
@app.errorhandler(NotFound)
def handle_not_found(e: NotFound) -> Response:
    code: int = e.code
    name: str = e.name
    description: str = e.description
    response: Response = jsonify({
        "code": code,
        "name": name,
        "description": description,
    })
    response.status_code = code
    return response


# Raise if the server used a method the resource does not handle. For example
# POST if the resource is view only. Especially useful for REST.
# https://werkzeug.palletsprojects.com/en/2.3.x/exceptions/#werkzeug.exceptions.MethodNotAllowed
@app.errorhandler(MethodNotAllowed)
def handle_method_not_allowed(e: MethodNotAllowed) -> Response:
    code: int = e.code
    name: str = e.name
    description: str = e.description
    response: Response = jsonify({
        "code": code,
        "name": name,
        "description": description,
    })
    response.status_code = code
    return response


# Raise to signal that a request cannot be completed because it conflicts with
# the current state on the server.
# https://werkzeug.palletsprojects.com/en/2.3.x/exceptions/#werkzeug.exceptions.Conflict
@app.errorhandler(Conflict)
def handle_conflict(e: Conflict) -> Response:
    code: int = e.code
    name: str = e.name
    description: str = e.description
    response: Response = jsonify({
        "code": code,
        "name": name,
        "description": description,
    })
    response.status_code = code
    return response


# Raise if a resource existed previously and went away without new location.
# https://werkzeug.palletsprojects.com/en/2.3.x/exceptions/#werkzeug.exceptions.Gone
@app.errorhandler(Gone)
def handle_gone(e: Gone) -> Response:
    code: int = e.code
    name: str = e.name
    description: str = e.description
    response: Response = jsonify({
        "code": code,
        "name": name,
        "description": description,
    })
    response.status_code = code
    return response


# The status code one should return if the data submitted exceeded a given
# limit.
# https://werkzeug.palletsprojects.com/en/2.3.x/exceptions/#werkzeug.exceptions.RequestEntityTooLarge
@app.errorhandler(RequestEntityTooLarge)
def handle_request_entity_too_large(e: RequestEntityTooLarge) -> Response:
    code: int = e.code
    name: str = e.name
    description: str = e.description
    response: Response = jsonify({
        "code": code,
        "name": name,
        "description": description,
    })
    response.status_code = code
    return response


# The status code returned if the server is unable to handle the media type the
# client transmitted.
# https://werkzeug.palletsprojects.com/en/2.3.x/exceptions/#werkzeug.exceptions.UnsupportedMediaType
@app.errorhandler(UnsupportedMediaType)
def handle_unsupported_media_type(e: UnsupportedMediaType) -> Response:
    code: int = e.code
    name: str = e.name
    description: str = e.description
    response: Response = jsonify({
        "code": code,
        "name": name,
        "description": description,
    })
    response.status_code = code
    return response


# Raise if an internal server error occurred. This is a good fallback if an
# unknown error occurred in the dispatcher.
# https://werkzeug.palletsprojects.com/en/2.3.x/exceptions/#werkzeug.exceptions.InternalServerError
@app.errorhandler(InternalServerError)
def handle_internal_server_error(e: InternalServerError) -> Response:
    code: int = e.code
    name: str = e.name
    description: str = e.description
    response: Response = jsonify({
        "code": code,
        "name": name,
        "description": description,
    })
    response.status_code = code
    return response


@app.route(rule="/")
@app.route(rule="/index")
def index() -> WerkzeugResponse | Response:
    # See before_request(), endpoint_whitelist.
    # index() is whitelisted.
    return redirect(
        location=url_for(
            endpoint="imageboard",
        ),
        code=302,
    )


@app.route(rule="/imageboard")
def imageboard() -> WerkzeugResponse | Response:
    # See before_request(), endpoint_whitelist.
    # imageboard() is whitelisted.
    return redirect(
        location=url_for(
            endpoint="static",
            filename="imageboard.html",
        ),
        code=302,
    )


@app.route(rule="/favicon.ico")
def favicon() -> WerkzeugResponse | Response:
    # See before_request(), endpoint_whitelist.
    # favicon() is whitelisted.
    return redirect(
        location=url_for(
            endpoint="static",
            filename="favicon.ico",
        ),
        code=302,
    )


# TODO(wathne): Return and raise proper status codes.
@app.route(
    rule="/api/cookie/settings",
    methods=["GET", "POST"],
)
def api_cookie_settings() -> Response:
    # pylint: disable=protected-access
    request_: Request = cast(LP[Request], request)._get_current_object()
    scs: SCS = cast(LP[SCS], session)._get_current_object()

    # See before_request(), endpoint_whitelist.
    # api_cookie_settings() is whitelisted.

    if request_.method == "POST":
        if request_.is_json:
            scs["settings"] = request_.get_json(
                force=False,
                silent=True,
                cache=False,
            )

    return jsonify(scs.get(key="settings", default=None))


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

    username: str | None = None
    password: str | None = None
    request_dict: dict[str, str | None] | None = None
    if request_.is_json:
        request_dict = request_.get_json(force=False, silent=True, cache=False)
    if isinstance(request_dict, dict):
        username = request_dict.get("username", None)
        password = request_dict.get("password", None)
    if username is None:
        raise BadRequest(description="No username.")
    if password is None:
        raise BadRequest(description="No password.")

    scs["username"] = username
    scs["password"] = password

    if db_con is None:
        raise InternalServerError(description="No database connection.")

    # See before_request(), endpoint_whitelist.
    # api_login() is whitelisted. We need to call load_user().
    load_user()
    print(f"Login as user_id: {acg.user_id}.")
    if acg.user_id is None:
        raise Unauthorized(description="Not logged in.")
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
        raise Unauthorized(description="Not logged in.")
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

    username: str | None = None
    password: str | None = None
    request_dict: dict[str, str | None] | None = None
    if request_.is_json:
        request_dict = request_.get_json(force=False, silent=True, cache=False)
    if isinstance(request_dict, dict):
        username = request_dict.get("username", None)
        password = request_dict.get("password", None)
    if username is None:
        raise BadRequest(description="No username.")
    if password is None:
        raise BadRequest(description="No password.")

    if db_con is None:
        raise InternalServerError(description="No database connection.")

    # Create user.
    insert_user_status: int = insert_user(
        db_con=db_con,
        user_name=username,
        user_password_hash=generate_password_hash(password=password),
        user_group=None,
    )
    # TODO(wathne): Return and raise proper status codes.
    if insert_user_status == -1:
        raise InternalServerError(description="Something went wrong.")
    if insert_user_status == -2:
        raise Conflict(description=f'The username "{username}" already exists.')

    scs["username"] = username
    scs["password"] = password

    # See before_request(), endpoint_whitelist.
    # api_users() is whitelisted. We need to call load_user().
    load_user()
    print(f"Login as user_id: {acg.user_id}.")
    if acg.user_id is None:
        raise Unauthorized(description="Not logged in.")
    return jsonify(acg.user_id)


@app.route(
    rule="/api/users/<int:user_id>",
    methods=["GET"],
)
def api_user(user_id: int | None = None) -> Response:
    # pylint: disable=protected-access
    acg: ACG = cast(LP[ACG], g)._get_current_object()
    request_: Request = cast(LP[Request], request)._get_current_object()
    db_con: Connection | None = get_database_connection()

    print(f"/api/users/{user_id} [{request_.method}] "
          f"as user_id: {acg.user_id}")

    if user_id is None:
        raise BadRequest(description="No user id.")

    if acg.user_id is None:
        raise Unauthorized(description="Not logged in.")

    if db_con is None:
        raise InternalServerError(description="No database connection.")

    # Retrieve user.
    if request_.method == "GET":
        # retrieve_user_status ~ user dict
        retrieve_user_status: dict[str, str | int] | None
        retrieve_user_status = retrieve_user_by_id(
            db_con=db_con,
            user_id=user_id,
        )
        # TODO(wathne): Return and raise proper status codes.
        if retrieve_user_status is None:
            raise InternalServerError(description="Something went wrong.")
        user_key_whitelist: set[str] = {
            "user_group",
            "user_id",
            "user_name",
            "user_timestamp",
        }
        # To avoid leaking sensitive information I think a whitelist is better
        # than a blacklist. If we blacklist the "user_password_hash" key and
        # then later change the key string without also updating this blacklist,
        # then we would leak the users password hash. Similarly, some not yet
        # invented user keys may also contain sensitive information. A whitelist
        # will stop these keys by default.
        secure_user: dict[str, str | int] = {}
        for key, value in retrieve_user_status.items():
            if key in user_key_whitelist:
                secure_user[key] = value
        return jsonify(secure_user)

    raise MethodNotAllowed(description=(
        f'Request method "{request_.method}" is not allowed at request path '
        f'"{request_.path}".'
    ))


@app.route(
    rule="/api/images",
    methods=["POST"],
)
def api_images() -> Response:
    # pylint: disable=protected-access
    acg: ACG = cast(LP[ACG], g)._get_current_object()
    request_: Request = cast(LP[Request], request)._get_current_object()
    db_con: Connection | None = get_database_connection()

    print(f"/api/images [{request_.method}] "
          f"as user_id: {acg.user_id}")

    request_file: FileStorage | None = request_.files.get(
        key="file",
        default=None,
    )

    if acg.user_id is None:
        raise Unauthorized(description="Not logged in.")

    if db_con is None:
        raise InternalServerError(description="No database connection.")

    # Upload image and also create thumbnail.
    if request_file is None:
        raise BadRequest(description="No image file.")
    if request_file.filename is None:
        raise BadRequest(description="No image filename.")
    request_secure_filename: str = secure_filename(request_file.filename)
    image_file_name: str = Path(request_secure_filename).stem
    image_file_extension: str = Path(request_secure_filename).suffix
    if image_file_extension.casefold() not in IMAGES_EXTENSIONS:
        raise UnsupportedMediaType(description=(
            "An image file is allowed to have the following extensions: "
            f"{', '.join(IMAGES_EXTENSIONS)}."
        ))
    # insert_image_status ~ image id
    insert_image_status: int = insert_image(
        db_con=db_con,
        user_id=acg.user_id,
        image_file_name=image_file_name,
        image_file_extension=image_file_extension,
    )
    # TODO(wathne): Return and raise proper status codes.
    if insert_image_status == -1:
        raise InternalServerError(description="Something went wrong.")
    # TODO(wathne): Context manager, a "with" statement.
    request_file.save(os_join(
        IMAGES_FOLDER,
        "".join((str(insert_image_status), image_file_extension)),
    ))
    request_file.close()
    return jsonify(insert_image_status)


@app.route(
    rule="/api/thumbnails/<int:image_id>",
    methods=["GET"],
)
@app.route(
    rule="/api/images/<int:image_id>",
    methods=["GET"],
)
def api_image(image_id: int | None = None) -> Response:
    # pylint: disable=protected-access
    acg: ACG = cast(LP[ACG], g)._get_current_object()
    request_: Request = cast(LP[Request], request)._get_current_object()
    db_con: Connection | None = get_database_connection()

    print(f"/api/images/{image_id} [{request_.method}] "
          f"as user_id: {acg.user_id}")

    if image_id is None:
        raise BadRequest(description="No image id.")

    if acg.user_id is None:
        raise Unauthorized(description="Not logged in.")

    if db_con is None:
        raise InternalServerError(description="No database connection.")

    # Retrieve image.
    # retrieve_image_status ~ image dict
    retrieve_image_status: dict[str, str | int] | None
    retrieve_image_status = retrieve_image(
        db_con=db_con,
        image_id=image_id,
    )
    # TODO(wathne): Return and raise proper status codes.
    if retrieve_image_status is None:
        raise InternalServerError(description="Something went wrong.")
    image_file_name: str = cast(str,
        retrieve_image_status["image_file_name"])
    image_file_extension: str = cast(str,
        retrieve_image_status["image_file_extension"])
    image_path: str = "".join((str(image_id), image_file_extension))
    image_download_name: str = "".join((image_file_name, image_file_extension))
    if not os_isfile(os_join(IMAGES_FOLDER, image_path)):
        print(f'Image is gone: "{image_path}" as "{image_download_name}"')
        raise Gone(description=(
            f"{image_path} as {image_download_name} should exist on the server."
            " The image file is gone."
        ))
    print(f'Image sent: "{image_path}" as "{image_download_name}"')
    return send_from_directory(
        directory=IMAGES_FOLDER,
        path=image_path,
        download_name=image_download_name,
        max_age=0,
    )


@app.route(
    rule="/api/threads",
    methods=["GET", "POST"],
)
def api_threads() -> Response:
    # pylint: disable=protected-access
    acg: ACG = cast(LP[ACG], g)._get_current_object()
    request_: Request = cast(LP[Request], request)._get_current_object()
    db_con: Connection | None = get_database_connection()

    print(f"/api/threads [{request_.method}] "
          f"as user_id: {acg.user_id}")

    image_id: int | None = None
    post_text: str | None = None
    thread_subject: str | None = None
    request_dict: dict[str, str | int | None] | None = None
    if request_.is_json:
        request_dict = request_.get_json(force=False, silent=True, cache=False)
    if isinstance(request_dict, dict):
        image_id = cast(int | None, request_dict.get("image_id", None))
        post_text = cast(str | None, request_dict.get("post_text", None))
        thread_subject = cast(str | None,
            request_dict.get("thread_subject", None),
        )

    if acg.user_id is None:
        raise Unauthorized(description="Not logged in.")

    if db_con is None:
        raise InternalServerError(description="No database connection.")

    # List threads.
    if request_.method == "GET":
        # retrieve_threads_status ~ list of thread dict
        retrieve_threads_status: list[dict[str, str | int | None]] | None
        retrieve_threads_status = retrieve_threads(
            db_con=db_con,
        )
        # TODO(wathne): Return and raise proper status codes.
        if retrieve_threads_status is None:
            raise InternalServerError(description="Something went wrong.")
        return jsonify(retrieve_threads_status)

    # Create thread and also create top post.
    if request_.method == "POST":
        if thread_subject is None:
            raise BadRequest(description="No thread subject.")
        # insert_thread_status ~ thread id
        insert_thread_status: int = insert_thread(
            db_con=db_con,
            user_id=acg.user_id,
            thread_subject=thread_subject,
            post_text=post_text,
            image_id=image_id,
        )
        # TODO(wathne): Return and raise proper status codes.
        if insert_thread_status == -1:
            raise InternalServerError(description="Something went wrong.")
        return jsonify(insert_thread_status)

    raise MethodNotAllowed(description=(
        f'Request method "{request_.method}" is not allowed at request path '
        f'"{request_.path}".'
    ))


# TODO(wathne): Combine api_thread() and api_thread_posts(). Check request path.
@app.route(
    rule="/api/threads/<int:thread_id>",
    methods=["GET", "PUT", "POST", "DELETE"],
)
def api_thread(thread_id: int | None = None) -> Response:
    # pylint: disable=protected-access
    acg: ACG = cast(LP[ACG], g)._get_current_object()
    request_: Request = cast(LP[Request], request)._get_current_object()
    db_con: Connection | None = get_database_connection()

    print(f"/api/threads/{thread_id} [{request_.method}] "
          f"as user_id: {acg.user_id}")

    if thread_id is None:
        raise BadRequest(description="No thread id.")

    image_id: int | None = None
    post_text: str | None = None
    thread_subject: str | None = None
    request_dict: dict[str, str | int | None] | None = None
    if request_.is_json:
        request_dict = request_.get_json(force=False, silent=True, cache=False)
    if isinstance(request_dict, dict):
        image_id = cast(int | None, request_dict.get("image_id", None))
        post_text = cast(str | None, request_dict.get("post_text", None))
        thread_subject = cast(str | None,
            request_dict.get("thread_subject", None),
        )

    if acg.user_id is None:
        raise Unauthorized(description="Not logged in.")

    if db_con is None:
        raise InternalServerError(description="No database connection.")

    # Retrieve thread and posts.
    if request_.method == "GET":
        # retrieve_thread_status ~ thread dict
        retrieve_thread_status: dict[str, str | int | None] | None
        retrieve_thread_status = retrieve_thread(
            db_con=db_con,
            thread_id=thread_id,
        )
        # TODO(wathne): Return and raise proper status codes.
        if retrieve_thread_status is None:
            raise InternalServerError(description="Something went wrong.")
        # retrieve_posts_status ~ list of post dict
        retrieve_posts_status: list[dict[str, str | int | None]] | None
        retrieve_posts_status = retrieve_posts(
            db_con=db_con,
            thread_id=thread_id,
        )
        # TODO(wathne): Return and raise proper status codes.
        if retrieve_posts_status is None:
            raise InternalServerError(description="Something went wrong.")
        thread_and_posts: dict[str,
            dict[str, str | int | None] |
            list[dict[str, str | int | None]]
        ] = {}
        thread_and_posts["thread"] = retrieve_thread_status
        thread_and_posts["posts"] = retrieve_posts_status
        return jsonify(thread_and_posts)

    # Update thread.
    if request_.method == "PUT":
        if thread_subject is None:
            raise BadRequest(description="No thread subject.")
        # update_thread_status ~ thread id
        update_thread_status: int = update_thread(
            db_con=db_con,
            user_id=acg.user_id,
            thread_id=thread_id,
            thread_subject=thread_subject,
            post_text=post_text,
            image_id=image_id,
        )
        if update_thread_status == thread_id:
            return jsonify(thread_id)
        if update_thread_status == -400:
            raise BadRequest(description="Something is wrong with the request.")
        if update_thread_status == -403:
            raise Forbidden(description=(
                "You do not have permission to update this thread. You may ask "
                "a moderator for help."
            ))
        if update_thread_status == -404:
            raise NotFound(description="The thread could not be found.")
        if update_thread_status == -500:
            raise InternalServerError(description="Database error.")
        raise InternalServerError(description="Something went wrong.")

    # Create post.
    if request_.method == "POST":
        # insert_post_status ~ post id
        insert_post_status: int = insert_post(
            db_con=db_con,
            user_id=acg.user_id,
            thread_id=thread_id,
            post_text=post_text,
            image_id=image_id,
        )
        # TODO(wathne): Return and raise proper status codes.
        if insert_post_status == -1:
            raise InternalServerError(description="Something went wrong.")
        return jsonify(insert_post_status)

    # Delete thread.
    if request_.method == "DELETE":
        # delete_thread_status ~ thread id
        delete_thread_status: int = delete_thread(
            db_con=db_con,
            user_id=acg.user_id,
            thread_id=thread_id,
        )
        if delete_thread_status == thread_id:
            return jsonify(thread_id)
        if delete_thread_status == -400:
            raise BadRequest(description="Something is wrong with the request.")
        if delete_thread_status == -403:
            raise Forbidden(description=(
                "You do not have permission to delete this thread. You may ask "
                "a moderator for help."
            ))
        if delete_thread_status == -404:
            raise NotFound(description="The thread could not be found.")
        if delete_thread_status == -500:
            raise InternalServerError(description="Database error.")
        raise InternalServerError(description="Something went wrong.")

    raise MethodNotAllowed(description=(
        f'Request method "{request_.method}" is not allowed at request path '
        f'"{request_.path}".'
    ))


# TODO(wathne): Combine api_thread() and api_thread_posts(). Check request path.
@app.route(
    rule="/api/threads/<int:thread_id>/posts",
    methods=["GET", "POST"],
)
def api_thread_posts(thread_id: int | None = None) -> Response:
    # pylint: disable=protected-access
    acg: ACG = cast(LP[ACG], g)._get_current_object()
    request_: Request = cast(LP[Request], request)._get_current_object()
    db_con: Connection | None = get_database_connection()

    print(f"/api/threads/{thread_id}/posts [{request_.method}] "
          f"as user_id: {acg.user_id}")

    if thread_id is None:
        raise BadRequest(description="No thread id.")

    image_id: int | None = None
    post_text: str | None = None
    request_dict: dict[str, str | int | None] | None = None
    if request_.is_json:
        request_dict = request_.get_json(force=False, silent=True, cache=False)
    if isinstance(request_dict, dict):
        image_id = cast(int | None, request_dict.get("image_id", None))
        post_text = cast(str | None, request_dict.get("post_text", None))

    if acg.user_id is None:
        raise Unauthorized(description="Not logged in.")

    if db_con is None:
        raise InternalServerError(description="No database connection.")

    # List posts.
    if request_.method == "GET":
        # retrieve_posts_status ~ list of post dict
        retrieve_posts_status: list[dict[str, str | int | None]] | None
        retrieve_posts_status = retrieve_posts(
            db_con=db_con,
            thread_id=thread_id,
        )
        # TODO(wathne): Return and raise proper status codes.
        if retrieve_posts_status is None:
            raise InternalServerError(description="Something went wrong.")
        return jsonify(retrieve_posts_status)

    # Create post.
    if request_.method == "POST":
        # insert_post_status ~ post id
        insert_post_status: int = insert_post(
            db_con=db_con,
            user_id=acg.user_id,
            thread_id=thread_id,
            post_text=post_text,
            image_id=image_id,
        )
        # TODO(wathne): Return and raise proper status codes.
        if insert_post_status == -1:
            raise InternalServerError(description="Something went wrong.")
        return jsonify(insert_post_status)

    raise MethodNotAllowed(description=(
        f'Request method "{request_.method}" is not allowed at request path '
        f'"{request_.path}".'
    ))


@app.route(
    rule="/api/posts/<int:post_id>",
    methods=["GET", "PUT", "DELETE"],
)
def api_post(post_id: int | None = None) -> Response:
    # pylint: disable=protected-access
    acg: ACG = cast(LP[ACG], g)._get_current_object()
    request_: Request = cast(LP[Request], request)._get_current_object()
    db_con: Connection | None = get_database_connection()

    print(f"/api/posts/{post_id} [{request_.method}] "
          f"as user_id: {acg.user_id}")

    if post_id is None:
        raise BadRequest(description="No post id.")

    image_id: int | None = None
    post_text: str | None = None
    request_dict: dict[str, str | int | None] | None = None
    if request_.is_json:
        request_dict = request_.get_json(force=False, silent=True, cache=False)
    if isinstance(request_dict, dict):
        image_id = cast(int | None, request_dict.get("image_id", None))
        post_text = cast(str | None, request_dict.get("post_text", None))

    if acg.user_id is None:
        raise Unauthorized(description="Not logged in.")

    if db_con is None:
        raise InternalServerError(description="No database connection.")

    # Retrieve post.
    if request_.method == "GET":
        # retrieve_post_status ~ post dict
        retrieve_post_status: dict[str, str | int | None] | None
        retrieve_post_status = retrieve_post(
            db_con=db_con,
            post_id=post_id,
        )
        # TODO(wathne): Return and raise proper status codes.
        if retrieve_post_status is None:
            raise InternalServerError(description="Something went wrong.")
        return jsonify(retrieve_post_status)

    # Update post.
    if request_.method == "PUT":
        # update_post_status ~ post id
        update_post_status: int = update_post(
            db_con=db_con,
            user_id=acg.user_id,
            post_id=post_id,
            post_text=post_text,
            image_id=image_id,
        )
        if update_post_status == post_id:
            return jsonify(post_id)
        if update_post_status == -400:
            raise BadRequest(description="Something is wrong with the request.")
        if update_post_status == -403:
            raise Forbidden(description=(
                "You do not have permission to update this post. You may ask a "
                "moderator for help."
            ))
        if update_post_status == -404:
            raise NotFound(description="The post could not be found.")
        if update_post_status == -500:
            raise InternalServerError(description="Database error.")
        raise InternalServerError(description="Something went wrong.")

    # Delete post.
    if request_.method == "DELETE":
        # delete_post_status ~ post id
        delete_post_status: int = delete_post(
            db_con=db_con,
            user_id=acg.user_id,
            post_id=post_id,
        )
        if delete_post_status == post_id:
            return jsonify(post_id)
        if delete_post_status == -400:
            raise BadRequest(description="Something is wrong with the request.")
        if delete_post_status == -403:
            raise Forbidden(description=(
                "You do not have permission to delete this post. You may ask a "
                "moderator for help."
            ))
        if delete_post_status == -404:
            raise NotFound(description="The post could not be found.")
        if delete_post_status == -500:
            raise InternalServerError(description="Database error.")
        raise InternalServerError(description="Something went wrong.")

    raise MethodNotAllowed(description=(
        f'Request method "{request_.method}" is not allowed at request path '
        f'"{request_.path}".'
    ))


if __name__ == "__main__":
    app.run(debug=True)

