from flask import Blueprint, request, jsonify
from datetime import datetime

from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)

from models import db
from models.user import User
from models.assignment import Assignment
from models.activity import Activity

assignments_bp = Blueprint(
    "assignments",
    __name__
)


@assignments_bp.route("", methods=["POST"])
@jwt_required()
def create_assignment():

    user_id = get_jwt_identity()

    user = User.query.get(user_id)

    data = request.get_json()

    due_date = None

    if data.get("due_date"):

        due_date = datetime.strptime(
            data.get("due_date"),
            "%Y-%m-%d"
        )

    assignment = Assignment(
        title=data.get("title"),
        description=data.get("description"),
        subject_id=data.get("subject_id"),
        due_date=due_date,
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
            "subject_id": assignment.subject_id,
            "due_date": (
                assignment.due_date.strftime("%Y-%m-%d")
                if assignment.due_date
                else None
            ),
            "created_by": (
                User.query.get(
                    assignment.created_by
                ).name
                if assignment.created_by
                else "Unknown"
            )
        }
        for assignment in assignments
    ])


@assignments_bp.route(
    "/subject/<int:subject_id>",
    methods=["GET"]
)
@jwt_required()
def get_subject_assignments(subject_id):

    assignments = Assignment.query.filter_by(
        subject_id=subject_id
    ).all()

    return jsonify([
        {
            "id": assignment.id,
            "title": assignment.title,
            "description": assignment.description,
            "subject_id": assignment.subject_id,
            "due_date": (
                assignment.due_date.strftime("%Y-%m-%d")
                if assignment.due_date
                else None
            ),
            "created_by": (
                User.query.get(
                    assignment.created_by
                ).name
                if assignment.created_by
                else "Unknown"
            )
        }
        for assignment in assignments
    ])