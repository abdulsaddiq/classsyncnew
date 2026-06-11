import os
from flask import Flask
from flask_cors import CORS
from config import Config
from models import db
from routes.auth import auth_bp
from flask_jwt_extended import JWTManager
from routes.subjects import subjects_bp
from routes.folders import folders_bp
from routes.files import files_bp
from routes.announcements import announcements_bp
from models.assignment import Assignment
from routes.assignments import assignments_bp
from models.activity import Activity
from routes.activities import activities_bp
from utils.supabase_client import supabase





app = Flask(__name__)

UPLOAD_FOLDER = "uploads"

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)

app.config.from_object(Config)
jwt = JWTManager(app)

CORS(app)

db.init_app(app)

app.register_blueprint(
    auth_bp,
    url_prefix="/api/auth"
)

app.register_blueprint(
    subjects_bp,
    url_prefix="/api/subjects"
)

app.register_blueprint(
    folders_bp,
    url_prefix="/api/folders"
)

app.register_blueprint(
    files_bp,
    url_prefix="/api/files"
)

app.register_blueprint(
    announcements_bp,
    url_prefix="/api/announcements"
)

app.register_blueprint(
    assignments_bp,
    url_prefix="/api/assignments"
)

app.register_blueprint(
    activities_bp,
    url_prefix="/api/activities"
)

with app.app_context():
    db.create_all()

@app.route("/")
def home():
    return {
        "message": "ClassSync Backend Running"
    }

@app.route("/test-supabase")
def test_supabase():
    try:
        buckets = supabase.storage.list_buckets()
        return {
            "success": True,
            "buckets": [bucket.name for bucket in buckets]
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }, 500


if __name__ == "__main__":
    app.run(debug=True)