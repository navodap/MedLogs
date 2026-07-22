from flask import Blueprint, request, jsonify

from database import get_connection

import bcrypt


auth = Blueprint(
    "auth",
    __name__
)



@auth.route(
    "/login",
    methods=["POST"]
)
def login():

    data = request.json


    username = data.get("username")

    password = data.get("password")


    connection = get_connection()

    cursor = connection.cursor()


    cursor.execute(
        """
        SELECT
            users.user_id,
            users.username,
            users.password_hash,
            roles.role_name

        FROM users

        JOIN roles

        ON users.role_id = roles.role_id

        WHERE username=%s
        """,
        (username,)
    )


    user = cursor.fetchone()


    cursor.close()
    connection.close()



    if user is None:

        return jsonify({

            "success":False,

            "message":"User not found"

        }),401



    password_check = bcrypt.checkpw(

        password.encode("utf-8"),

        user[2].encode("utf-8")

    )


    if not password_check:

        return jsonify({

            "success":False,

            "message":"Incorrect password"

        }),401



    return jsonify({

        "success":True,

        "message":"Login successful",

        "user":{

            "id":user[0],

            "username":user[1],

            "role":user[3]

        }

    })