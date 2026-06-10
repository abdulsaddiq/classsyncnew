from flask import Blueprint, jsonify

from flask_jwt_extended import (
    jwt_required
)

from models.activity import Activity

activities_bp = Blueprint(
    "activities",
    __name__
)


@activities_bp.route("", methods=["GET"])
@jwt_required()
def get_activities():

    activities = Activity.query.order_by(
        Activity.created_at.desc()
    ).limit(10).all()

    return jsonify([
        {
            "id": activity.id,
            "message": activity.message
        }
        for activity in activities
    ])