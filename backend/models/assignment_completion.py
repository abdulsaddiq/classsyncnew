from models import db
from datetime import datetime


class AssignmentCompletion(db.Model):
    __tablename__ = "assignment_completions"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    assignment_id = db.Column(
        db.Integer,
        db.ForeignKey("assignments.id"),
        nullable=False
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    completed = db.Column(
        db.Boolean,
        default=False
    )

    completed_at = db.Column(
        db.DateTime
    )