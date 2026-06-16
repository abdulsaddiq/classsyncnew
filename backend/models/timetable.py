from . import db

class Timetable(db.Model):
    __tablename__ = "timetables"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    subject_id = db.Column(
        db.Integer,
        db.ForeignKey("subjects.id"),
        nullable=False
    )

    day = db.Column(
        db.String(20),
        nullable=False
    )

    start_time = db.Column(
        db.String(10),
        nullable=False
    )

    end_time = db.Column(
        db.String(10),
        nullable=False
    )

    room = db.Column(
        db.String(100),
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