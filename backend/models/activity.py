from . import db


class Activity(db.Model):
    __tablename__ = "activities"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    message = db.Column(
        db.String(255),
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )