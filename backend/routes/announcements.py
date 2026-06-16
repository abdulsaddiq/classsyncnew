from flask import Blueprint, request, jsonify

from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)

from models import db
from models.user import User
from models.announcement import Announcement
from models.activity import Activity

ROLE_LEVELS = {
    "student": 1,
    "coordinator": 2,
    "cr": 3,
    "lr": 3,
    "moderator": 4,
    "admin": 5
}

announcements_bp = Blueprint(
    "announcements",
    __name__
)


@announcements_bp.route("", methods=["POST"])
@jwt_required()
def create_announcement():

    user_id = get_jwt_identity()

    user = User.query.get(user_id)

    data = request.get_json()

    announcement = Announcement(
        title=data.get("title"),
        content=data.get("content"),
        created_by=user.id
    )

    db.session.add(announcement)

    activity = Activity(
        message=f"📢 New announcement: {announcement.title}"
    )

    db.session.add(activity)

    db.session.commit()

    return jsonify({
        "message": "Announcement created"
    }), 201


@announcements_bp.route("", methods=["GET"])
@jwt_required()
def get_announcements():

    announcements = Announcement.query.order_by(
        Announcement.created_at.desc()
    ).all()

    result = []

    for announcement in announcements:

        creator = User.query.get(
            announcement.created_by
        )

        result.append({
            "id": announcement.id,
            "title": announcement.title,
            "content": announcement.content,
            "created_by": creator.name if creator else "Unknown",
            "created_by_id": creator.id if creator else None,
            "created_by_role": creator.role if creator else None,
            "created_at": announcement.created_at.isoformat()
        })

    return jsonify(result)

@announcements_bp.route("/<int:announcement_id>", methods=["DELETE"])
@jwt_required()
def delete_announcement(announcement_id):

    user_id = get_jwt_identity()

    user = User.query.get(user_id)

    announcement = Announcement.query.get(
        announcement_id
    )

    if not announcement:
        return jsonify({
            "error": "Announcement not found"
        }), 404

    creator = User.query.get(
        announcement.created_by
    )

    # own announcement
    if announcement.created_by == user.id:
        pass

    # higher role deleting lower role
    elif (
        creator
        and ROLE_LEVELS[user.role]
        > ROLE_LEVELS[creator.role]
    ):
        pass

    else:
        return jsonify({
            "error": "Permission denied"
        }), 403

    db.session.delete(announcement)

    db.session.commit()

    return jsonify({
        "message": "Announcement deleted successfully"
    }), 200