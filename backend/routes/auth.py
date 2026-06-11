from flask import Blueprint, request, jsonify
from models import db
from models.user import User
from flask_jwt_extended import create_access_token
import bcrypt
from flask_jwt_extended import jwt_required, get_jwt_identity

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/signup", methods=["POST"])
def signup():

    data = request.get_json()

    name = data.get("name")
    roll_no = data.get(
    "roll_no"
).strip().upper()
    password = data.get("password")

    existing_user = User.query.filter_by(
        roll_no=roll_no
    ).first()

    if existing_user:
        return jsonify({
            "error": "Roll number already exists"
        }), 400

    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    )

    role = "student"

    if User.query.count() == 0:
        role = "admin"

    new_user = User(
    name=name,
    roll_no=roll_no,
    password_hash=hashed_password.decode("utf-8"),
    role=role
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "message": "User created successfully"
    }), 201

@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    roll_no = data.get(
    "roll_no"
).strip().upper()
    password = data.get("password")

    user = User.query.filter_by(
        roll_no=roll_no
    ).first()

    if not user:
        return jsonify({
            "error": "Invalid credentials"
        }), 401

    if not bcrypt.checkpw(
        password.encode("utf-8"),
        user.password_hash.encode("utf-8")
    ):
        return jsonify({
            "error": "Invalid credentials"
        }), 401

    access_token = create_access_token(
        identity=str(user.id)
    )

    return jsonify({
        "message": "Login successful",
        "token": access_token,
        "user": {
            "id": user.id,
            "name": user.name,
            "roll_no": user.roll_no,
            "role": user.role
        }
    }), 200

@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def profile():

    user_id = get_jwt_identity()

    user = User.query.get(user_id)

    return jsonify({
        "id": user.id,
        "name": user.name,
        "roll_no": user.roll_no,
        "role": user.role
    })

@auth_bp.route("/users", methods=["GET"])
@jwt_required()
def get_users():

    user_id = get_jwt_identity()

    user = User.query.get(user_id)

    if user.role != "admin":
        return jsonify({
            "error": "Admin access required"
        }), 403

    users = User.query.all()

    return jsonify([
        {
            "id": u.id,
            "name": u.name,
            "roll_no": u.roll_no,
            "role": u.role
        }
        for u in users
    ])

@auth_bp.route("/users/<int:user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):

    current_user_id = get_jwt_identity()

    current_user = User.query.get(
        current_user_id
    )

    if current_user.role != "admin":
        return jsonify({
            "error": "Admin access required"
        }), 403

    user = User.query.get(user_id)

    if not user:
        return jsonify({
            "error": "User not found"
        }), 404

    if user.role == "admin":
        return jsonify({
            "error": "Cannot delete admin"
        }), 400

    db.session.delete(user)
    db.session.commit()

    return jsonify({
        "message": "User deleted"
    })

@auth_bp.route("/users/<int:user_id>/role", methods=["PUT"])
@jwt_required()
def update_role(user_id):

    current_user_id = get_jwt_identity()

    current_user = User.query.get(
        current_user_id
    )

    if current_user.role != "admin":
        return jsonify({
            "error": "Admin access required"
        }), 403

    user = User.query.get(user_id)

    if not user:
        return jsonify({
            "error": "User not found"
        }), 404

    if user.role == "admin":
        user.role = "student"
    else:
        user.role = "admin"

    db.session.commit()

    return jsonify({
        "message": "Role updated",
        "role": user.role
    })

@auth_bp.route("/stats", methods=["GET"])
@jwt_required()
def get_stats():

    user_id = get_jwt_identity()

    user = User.query.get(user_id)

    if user.role != "admin":
        return jsonify({
            "error": "Admin access required"
        }), 403

    from models.subject import Subject
    from models.folder import Folder
    from models.file import File
    from models.announcement import Announcement

    return jsonify({
        "subjects": Subject.query.count(),
        "folders": Folder.query.filter_by(
            is_deleted=False
        ).count(),
        "files": File.query.filter_by(
            is_deleted=False
        ).count(),
        "users": User.query.count(),
        "announcements": Announcement.query.count()
    })