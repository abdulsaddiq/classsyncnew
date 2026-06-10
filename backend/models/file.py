from . import db

class File(db.Model):
    __tablename__ = "files"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    folder_id = db.Column(
        db.Integer,
        db.ForeignKey("folders.id")
    )

    file_name = db.Column(
        db.String(255),
        nullable=False
    )

    file_url = db.Column(
        db.Text,
        nullable=False
    )

    file_type = db.Column(
        db.String(20)
    )

    uploaded_by = db.Column(
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