from flask import Blueprint, jsonify

from database import get_connection


admin = Blueprint(
    "admin",
    __name__
)


@admin.route("/admin/users", methods=["GET"])
def get_users():


    connection = get_connection()

    cursor = connection.cursor()


    cursor.execute(
        """
        SELECT
            users.user_id,
            users.full_name,
            roles.role_name,
            users.account_status

        FROM users

        JOIN roles

        ON users.role_id = roles.role_id

        ORDER BY users.user_id
        """
    )


    rows = cursor.fetchall()


    users=[]


    for row in rows:

        users.append({

            "id":row[0],

            "name":row[1],

            "role":row[2],

            "status":row[3]

        })


    cursor.close()

    connection.close()


    return jsonify(users)