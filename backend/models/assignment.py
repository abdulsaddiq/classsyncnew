from . import db


class Assignment(db.Model):
    __tablename__ = "assignments"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    title = db.Column(
        db.String(200),
        nullable=False
    )

    description = db.Column(
        db.Text,
        nullable=True
    )

    subject_id = db.Column(
        db.Integer,
        db.ForeignKey("subjects.id"),
        nullable=False
    )

    due_date = db.Column(
        db.DateTime,
        nullable=True
    )

    created_by = db.Column(
        db.Integer,
        db.ForeignKey("users.id")
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )

    subject = db.relationship(
        "Subject",
        backref="assignments"
    )

    creator = db.relationship(
        "User",
        backref="assignments"
    )