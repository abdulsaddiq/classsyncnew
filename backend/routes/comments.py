from flask import Blueprint, request, jsonify

from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)

from models import db
from models.comment import Comment
from models.user import User


comments_bp = Blueprint(
    "comments",
    __name__
)


@comments_bp.route("", methods=["POST"])
@jwt_required()
def create_comment():

    user_id = get_jwt_identity()

    data = request.get_json()

    comment = Comment(
        file_id=data.get("file_id"),
        user_id=user_id,
        content=data.get("content")
    )

    db.session.add(comment)
    db.session.commit()

    return jsonify({
        "message": "Comment added"
    }), 201

@comments_bp.route(
    "/file/<int:file_id>",
    methods=["GET"]
)
@jwt_required()
def get_file_comments(file_id):

    comments = Comment.query.filter_by(
        file_id=file_id
    ).order_by(
        Comment.created_at.desc()
    ).all()

    return jsonify([
        {
            "id": comment.id,
            "username": (
                User.query.get(
                    comment.user_id
                ).name
                if comment.user_id
                else "Unknown"
            ),

            "content": comment.content,
            
            "created_at": (
                comment.created_at.strftime(
                    "%Y-%m-%d %H:%M"
                )
                if comment.created_at
                else None
            )
        }
        for comment in comments
    ])