from flask import Blueprint, request, jsonify
from models.folder import Folder


from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)

from models import db
from models.user import User
from models.subject import Subject

subjects_bp = Blueprint(
    "subjects",
    __name__
)


@subjects_bp.route("", methods=["POST"])
@jwt_required()
def create_subject():

    user_id = get_jwt_identity()

    user = User.query.get(user_id)

    if user.role != "admin":
        return jsonify({
            "error": "Admin access required"
        }), 403

    data = request.get_json()

    name = data.get("name")

    existing_subject = Subject.query.filter_by(
        name=name
    ).first()

    if existing_subject:
        return jsonify({
            "error": "Subject already exists"
        }), 400

    subject = Subject(
        name=name,
        created_by=user.id
    )

    db.session.add(subject)
    db.session.commit()

    return jsonify({
        "message": "Subject created",
        "subject": {
            "id": subject.id,
            "name": subject.name
        }
    }), 201


@subjects_bp.route("", methods=["GET"])
@jwt_required()
def get_subjects():

    subjects = Subject.query.all()

    return jsonify([
        {
            "id": s.id,
            "name": s.name
        }
        for s in subjects
    ])

@subjects_bp.route("/<int:subject_id>/folders", methods=["GET"])
@jwt_required()
def get_subject_folders(subject_id):

    folders = Folder.query.filter_by(
        subject_id=subject_id,
        parent_folder_id=None
    ).all()

    return jsonify([
        {
            "id": folder.id,
            "folder_name": folder.folder_name
        }
        for folder in folders
    ])

@subjects_bp.route("/<int:subject_id>", methods=["DELETE"])
@jwt_required()
def delete_subject(subject_id):

    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if user.role != "admin":
        return jsonify({
            "error": "Admin access required"
        }), 403

    subject = Subject.query.get(subject_id)

    if not subject:
        return jsonify({
            "error": "Subject not found"
        }), 404

    db.session.delete(subject)
    db.session.commit()

    return jsonify({
        "message": "Subject deleted successfully"
    }), 200