import os

import uuid

from utils.supabase_client import supabase

from flask import (
    Blueprint,
    request,
    jsonify,
    send_file
)

from werkzeug.utils import secure_filename

from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)

from models import db
from models.user import User
from models.file import File
from models.activity import Activity

files_bp = Blueprint(
    "files",
    __name__
)

UPLOAD_FOLDER = "uploads"


@files_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_file():

    user_id = get_jwt_identity()

    user = User.query.get(user_id)

    if user.role != "admin":
        return jsonify({
            "error": "Admin access required"
        }), 403

    uploaded_file = request.files.get("file")

    folder_id = request.form.get(
        "folder_id"
    )

    if not uploaded_file:
        return jsonify({
            "error": "No file provided"
        }), 400

    filename = secure_filename(
     uploaded_file.filename
)

    unique_filename = (
      f"{uuid.uuid4()}_{filename}"
)

    file_bytes = uploaded_file.read()

    supabase.storage.from_(
    "classsync-files"
).upload(
    unique_filename,
    file_bytes,
    {
        "content-type":
        uploaded_file.content_type
    }
)

    filepath = supabase.storage.from_(
    "classsync-files"
).get_public_url(
    unique_filename
)

    new_file = File(
        folder_id=folder_id,
        file_name=filename,
        file_url=filepath,
        file_type=filename.split(".")[-1],
        uploaded_by=user.id
    )

    db.session.add(new_file)

    activity = Activity(
        message=f"📄 New file uploaded: {filename}"
    )

    db.session.add(activity)

    db.session.commit()

    return jsonify({
        "message": "File uploaded",
        "file_name": filename
    }), 201


@files_bp.route(
    "/folder/<int:folder_id>",
    methods=["GET"]
)
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
            "file_type": file.file_type
        }
        for file in files
    ])


@files_bp.route(
    "/view/<int:file_id>",
    methods=["GET"]
)
def view_file(file_id):

    file = File.query.get(file_id)

    if not file:
        return jsonify({
            "error": "File not found"
        }), 404

    return send_file(
        file.file_url,
        as_attachment=False
    )


@files_bp.route(
    "/download/<int:file_id>",
    methods=["GET"]
)
@jwt_required()
def download_file(file_id):

    file = File.query.get(file_id)

    if not file:
        return jsonify({
            "error": "File not found"
        }), 404

    return send_file(
        file.file_url,
        as_attachment=True
    )


@files_bp.route(
    "/<int:file_id>",
    methods=["DELETE"]
)
@jwt_required()
def delete_file(file_id):

    user_id = get_jwt_identity()

    user = User.query.get(user_id)

    if user.role != "admin":
        return jsonify({
            "error": "Admin access required"
        }), 403

    file = File.query.get(file_id)

    if not file:
        return jsonify({
            "error": "File not found"
        }), 404

    file.is_deleted = True

    db.session.commit()

    return jsonify({
        "message": "File deleted"
    })