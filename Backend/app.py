from flask import Flask, jsonify
from database import get_connection
from routes.auth import auth
from routes.admin import admin
from routes.police_court import police_court
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
app.register_blueprint(
    auth,
    url_prefix="/api"
)
app.register_blueprint(
    admin,
    url_prefix="/api"
)
app.register_blueprint(
    police_court,
    url_prefix="/api"
)

@app.route("/")
def home():
    return "MedLogs Backend Running"


@app.route("/api/test")
def test():

    return jsonify({
        "status": "success",
        "message": "API is working"
    })

@app.route("/api/database-test")
def database_test():

    try:

        connection = get_connection()

        cursor = connection.cursor()

        cursor.execute(
            "SELECT CURRENT_TIMESTAMP;"
        )

        result = cursor.fetchone()


        cursor.close()

        connection.close()


        return jsonify({

            "status": "success",

            "database_time": str(result[0])

        })


    except Exception as error:


        return jsonify({

            "status": "error",

            "message": str(error)

        })
if __name__ == "__main__":
    app.run(
        debug=True,
        port=5000
    )
