from flask import Blueprint, jsonify, request
from psycopg2 import errorcodes

from database import get_connection


police_court = Blueprint("police_court", __name__)

VALID_TYPES = {"Police Referral", "Court Matter"}
VALID_STATUSES = {"Pending", "Scheduled", "Submitted", "Completed"}
VALID_PRIORITIES = {"Normal", "Urgent", "Court Priority"}


def record_to_json(row):
    return {
        "id": row[0],
        "type": row[1],
        "caseId": row[2],
        "reference": row[3],
        "authority": row[4],
        "contact": row[5] or "",
        "actionDate": row[6].isoformat() if row[6] else "",
        "status": row[7],
        "priority": row[8],
        "notes": row[9] or "",
    }


SELECT_FIELDS = """
    coordination_id,
    record_type,
    case_id,
    reference_no,
    authority_name,
    contact_person,
    action_date,
    coordination_status,
    priority,
    notes
"""


@police_court.route("/police-court", methods=["GET"])
def list_records():
    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            f"""
            SELECT {SELECT_FIELDS}
            FROM authority_coordination_record
            ORDER BY created_at DESC
            """
        )
        return jsonify([record_to_json(row) for row in cursor.fetchall()])
    finally:
        cursor.close()
        connection.close()


@police_court.route("/police-court", methods=["POST"])
def create_record():
    data = request.get_json(silent=True) or {}
    required = {
        "type": data.get("type"),
        "caseId": str(data.get("caseId", "")).strip(),
        "reference": str(data.get("reference", "")).strip(),
        "authority": str(data.get("authority", "")).strip(),
    }
    missing = [name for name, value in required.items() if not value]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

    if data["type"] not in VALID_TYPES:
        return jsonify({"error": "Invalid record type."}), 400
    if data.get("status", "Pending") not in VALID_STATUSES:
        return jsonify({"error": "Invalid status."}), 400
    if data.get("priority", "Normal") not in VALID_PRIORITIES:
        return jsonify({"error": "Invalid priority."}), 400

    connection = get_connection()
    cursor = connection.cursor()
    try:
        cursor.execute(
            f"""
            INSERT INTO authority_coordination_record (
                record_type,
                case_id,
                reference_no,
                authority_name,
                contact_person,
                action_date,
                coordination_status,
                priority,
                notes
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING {SELECT_FIELDS}
            """,
            (
                data["type"],
                required["caseId"],
                required["reference"],
                required["authority"],
                str(data.get("contact", "")).strip() or None,
                data.get("actionDate") or None,
                data.get("status", "Pending"),
                data.get("priority", "Normal"),
                str(data.get("notes", "")).strip() or None,
            ),
        )
        row = cursor.fetchone()
        connection.commit()
        return jsonify(record_to_json(row)), 201
    except Exception as error:
        connection.rollback()
        if getattr(error, "pgcode", None) == errorcodes.FOREIGN_KEY_VIOLATION:
            return jsonify({"error": "The Case ID does not exist. Create the case first."}), 400
        if getattr(error, "pgcode", None) == errorcodes.UNIQUE_VIOLATION:
            return jsonify({"error": "That reference number already exists."}), 409
        raise
    finally:
        cursor.close()
        connection.close()


@police_court.route("/police-court/<int:record_id>", methods=["PATCH"])
def update_record(record_id):
    data = request.get_json(silent=True) or {}
    status = data.get("status")
    if status not in VALID_STATUSES:
        return jsonify({"error": "Invalid status."}), 400

    connection = get_connection()
    cursor = connection.cursor()
    try:
        cursor.execute(
            f"""
            UPDATE authority_coordination_record
            SET coordination_status = %s, updated_at = CURRENT_TIMESTAMP
            WHERE coordination_id = %s
            RETURNING {SELECT_FIELDS}
            """,
            (status, record_id),
        )
        row = cursor.fetchone()
        if row is None:
            connection.rollback()
            return jsonify({"error": "Record not found."}), 404
        connection.commit()
        return jsonify(record_to_json(row))
    finally:
        cursor.close()
        connection.close()
