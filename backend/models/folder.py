from . import db

class Folder(db.Model):
    __tablename__ = "folders"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    folder_name = db.Column(
        db.String(100),
        nullable=False
    )

    subject_id = db.Column(
        db.Integer,
        db.ForeignKey("subjects.id"),
        nullable=False
    )

    parent_folder_id = db.Column(
        db.Integer,
        db.ForeignKey("folders.id"),
        nullable=True
    )

    created_by = db.Column(
        db.Integer,
        db.ForeignKey("users.id")
    )

    is_deleted = db.Column(
    db.Boolean,
    default=False
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )