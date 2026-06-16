from flask import Blueprint, request, jsonify

from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)

from models import db
from models.user import User
from models.subject import Subject
from models.timetable import Timetable

from utils.permissions import (
    ACADEMIC_ROLES,
    TIMETABLE_EDIT_ROLES
)


timetables_bp = Blueprint(
    "timetables",
    __name__
)


@timetables_bp.route("", methods=["POST"])
@jwt_required()
def create_timetable():

    user_id = get_jwt_identity()

    user = User.query.get(user_id)

    if not user:
        return jsonify({
            "error": "User not found"
        }), 404

    if user.role not in TIMETABLE_EDIT_ROLES:
        return jsonify({
            "error": "Permission denied"
        }), 403

    data = request.get_json()

    if isinstance(data, list):
        data = data[0]

    subject = Subject.query.get(
        data.get("subject_id")
    )

    if not subject:
        return jsonify({
            "error": "Subject not found"
        }), 404

    timetable = Timetable(
        subject_id=data.get("subject_id"),
        day=data.get("day"),
        start_time=data.get("start_time"),
        end_time=data.get("end_time"),
        room=data.get("room"),
        created_by=user.id
    )

    db.session.add(timetable)
    db.session.commit()

    return jsonify({
        "message": "Timetable entry created"
    }), 201


@timetables_bp.route("", methods=["GET"])
@jwt_required()
def get_timetable():

    entries = Timetable.query.order_by(
        Timetable.day.asc()
    ).all()

    return jsonify([
        {
            "id": entry.id,
            "subject_id": entry.subject_id,
            "subject_name": (
                Subject.query.get(
                    entry.subject_id
                ).name
                if entry.subject_id
                else "Unknown"
            ),
            "day": entry.day,
            "start_time": entry.start_time,
            "end_time": entry.end_time,
            "room": entry.room
        }
        for entry in entries
    ])


@timetables_bp.route(
    "/<int:timetable_id>",
    methods=["DELETE"]
)
@jwt_required()
def delete_timetable(timetable_id):

    user_id = get_jwt_identity()

    user = User.query.get(user_id)

    if not user:
        return jsonify({
            "error": "User not found"
        }), 404

    if user.role not in TIMETABLE_EDIT_ROLES:
        return jsonify({
            "error": "Permission denied"
        }), 403

    timetable = Timetable.query.get(
        timetable_id
    )

    if not timetable:
        return jsonify({
            "error": "Timetable entry not found"
        }), 404

    db.session.delete(timetable)

    db.session.commit()

    return jsonify({
        "message": "Timetable entry deleted"
    }), 200


@timetables_bp.route(
    "/<int:timetable_id>",
    methods=["PUT"]
)
@jwt_required()
def update_timetable(timetable_id):

    user_id = int(
        get_jwt_identity()
    )

    user = User.query.get(user_id)

    if not user:
        return jsonify({
            "error": "User not found"
        }), 404

    if user.role not in TIMETABLE_EDIT_ROLES:
        return jsonify({
            "error": "Permission denied"
        }), 403

    timetable = Timetable.query.get(
        timetable_id
    )

    if not timetable:
        return jsonify({
            "error": "Timetable not found"
        }), 404

    data = request.get_json()

    timetable.subject_id = data.get(
        "subject_id",
        timetable.subject_id
    )

    timetable.room = data.get(
        "room",
        timetable.room
    )

    db.session.commit()

    return jsonify({
        "message": "Timetable updated"
    })