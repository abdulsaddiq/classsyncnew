from flask import Blueprint, request, jsonify
from models.activity import Activity



from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)

from models import db
from models.user import User
from models.assignment import Assignment


assignments_bp = Blueprint(
    "assignments",
    __name__
)


@assignments_bp.route("", methods=["POST"])
@jwt_required()
def create_assignment():

    user_id = get_jwt_identity()

    user = User.query.get(user_id)

    if user.role != "admin":
        return jsonify({
            "error": "Admin access required"
        }), 403

    data = request.get_json()

    assignment = Assignment(
        title=data.get("title"),
        description=data.get("description"),
        subject_id=data.get("subject_id"),
        created_by=user.id
    )

    db.session.add(assignment)
    activity = Activity(
    message=f"📝 New assignment: {assignment.title}"
    )

    db.session.add(activity)
    db.session.commit()

    return jsonify({
        "message": "Assignment created",
        "id": assignment.id
    }), 201

@assignments_bp.route("", methods=["GET"])
@jwt_required()
def get_assignments():

    assignments = Assignment.query.all()

    return jsonify([
        {
            "id": assignment.id,
            "title": assignment.title,
            "description": assignment.description,
            "subject_id": assignment.subject_id
        }
        for assignment in assignments
    ])

@assignments_bp.route(
    "/subject/<int:subject_id>",
    methods=["GET"]
)
@jwt_required()
def get_subject_assignments(
    subject_id
):

    assignments = Assignment.query.filter_by(
        subject_id=subject_id
    ).all()

    return jsonify([
        {
            "id": assignment.id,
            "title": assignment.title,
            "description": assignment.description,
            "subject_id": assignment.subject_id
        }
        for assignment in assignments
    ])