from flask import Blueprint, request, jsonify
from models.file import File
from models.activity import Activity

from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)

from models import db
from models.user import User
from models.folder import Folder
from utils.permissions import ACADEMIC_ROLES

folders_bp = Blueprint(
    "folders",
    __name__
)


@folders_bp.route("", methods=["POST"])
@jwt_required()
def create_folder():

    user_id = get_jwt_identity()

    user = User.query.get(user_id)

    if user.role not in ACADEMIC_ROLES:
        return jsonify({
            "error": "Admin access required"
        }), 403

    data = request.get_json()

    folder = Folder(
        folder_name=data.get("folder_name"),
        subject_id=data.get("subject_id"),
        parent_folder_id=data.get("parent_folder_id"),
        created_by=user.id
    )

    db.session.add(folder)
    activity = Activity(
    message=f"📁 New folder created: {folder.folder_name}"
    )

    db.session.add(activity)
    db.session.commit()

    return jsonify({
        "message": "Folder created",
        "folder": {
            "id": folder.id,
            "folder_name": folder.folder_name
        }
    }), 201


@folders_bp.route("/subject/<int:subject_id>", methods=["GET"])
@jwt_required()
def get_subject_folders(subject_id):

    folders = Folder.query.filter_by(
        subject_id=subject_id,
        is_deleted=False
    ).all()

    folder_map = {}

    for folder in folders:
        folder_map[folder.id] = {
            "id": folder.id,
            "folder_name": folder.folder_name,
            "parent_folder_id": folder.parent_folder_id,
            "children": []
        }

    root_folders = []

    for folder in folder_map.values():

        parent_id = folder["parent_folder_id"]

        if parent_id is None:
            root_folders.append(folder)

        else:
            folder_map[parent_id]["children"].append(folder)

    return jsonify(root_folders)

@folders_bp.route("/<int:folder_id>/files", methods=["GET"])
@jwt_required()
def get_folder_files(folder_id):

    files = File.query.filter_by(
        folder_id=folder_id,
        is_deleted=False
    ).all()

    return jsonify([
        {
            "id": file.id,
            "file_name": file.file_name,
            "file_type": file.file_type,
            "uploaded_by": file.uploaded_by
        }
        for file in files
    ])

@folders_bp.route("/<int:folder_id>/children", methods=["GET"])
@jwt_required()
def get_child_folders(folder_id):

    folders = Folder.query.filter_by(
    parent_folder_id=folder_id,
    is_deleted=False
).all()

    return jsonify([
        {
            "id": folder.id,
            "folder_name": folder.folder_name
        }
        for folder in folders
    ])

@folders_bp.route("/<int:folder_id>", methods=["DELETE"])
@jwt_required()
def delete_folder(folder_id):

    user_id = get_jwt_identity()

    user = User.query.get(user_id)

    if user.role not in ACADEMIC_ROLES:
        return jsonify({
            "error": "Admin access required"
        }), 403

    folder = Folder.query.get(folder_id)

    if not folder:
        return jsonify({
            "error": "Folder not found"
        }), 404

    folder.is_deleted = True

    db.session.commit()

    return jsonify({
        "message": "Folder deleted"
    })

@folders_bp.route("/all", methods=["GET"])
@jwt_required()
def get_all_folders():

    user_id = get_jwt_identity()

    user = User.query.get(user_id)

    if user.role not in ["admin", "moderator"]:
        return jsonify({
            "error": "Access denied"
        }), 403

    folders = Folder.query.filter_by(
        is_deleted=False
    ).all()

    users = {
        user.id: user
        for user in User.query.all()
    }

    from models.subject import Subject

    subjects = {
        subject.id: subject
        for subject in Subject.query.all()
    }

    folder_lookup = {
        folder.id: folder
        for folder in folders
    }

    return jsonify([
        {
    "id": folder.id,
    "folder_name": folder.folder_name,

    "subject_id": folder.subject_id,
    "subject_name": (
        subjects.get(folder.subject_id).name
        if subjects.get(folder.subject_id)
        else None
    ),

    "parent_folder_id": folder.parent_folder_id,
    "parent_folder_name": (
        folder_lookup.get(
            folder.parent_folder_id
        ).folder_name
        if folder.parent_folder_id
        and folder_lookup.get(
            folder.parent_folder_id
        )
        else None
    ),

    "created_by": folder.created_by,
    "created_by_name": (
        users.get(folder.created_by).name
        if users.get(folder.created_by)
        else "Unknown"
    ),

    "file_count": File.query.filter_by(
        folder_id=folder.id,
        is_deleted=False
    ).count()
}
        for folder in folders
    ])