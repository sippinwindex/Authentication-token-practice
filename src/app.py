# src/app.py - UPDATED with proper JWT configuration
import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from flask_cors import CORS
from api.utils import APIException, generate_sitemap
from api.models import db, User
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from flask_jwt_extended import JWTManager
from datetime import timedelta

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../dist/')

app = Flask(__name__)
app.url_map.strict_slashes = False

# Configure CORS properly
CORS(app, resources={
    r"/api/*": {
        "origins": ["*"],  # Be more restrictive in production
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# PROPER JWT CONFIGURATION
# Get secrets from environment variables (check both possible names)
jwt_secret = os.getenv('JWT_SECRET_KEY') or os.getenv('JWT_SECRET')
flask_secret = os.getenv('SECRET_KEY')

# Provide fallbacks for development
if not jwt_secret:
    jwt_secret = "fallback-jwt-secret-key-for-development-only"
    print("⚠️  WARNING: Using fallback JWT secret. Set JWT_SECRET_KEY in .env file!")

if not flask_secret:
    flask_secret = "fallback-flask-secret-key-for-development-only"
    print("⚠️  WARNING: Using fallback Flask secret. Set SECRET_KEY in .env file!")

app.config['SECRET_KEY'] = flask_secret
app.config['JWT_SECRET_KEY'] = jwt_secret
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)  # Extended for development

# Initialize JWT
jwt = JWTManager(app)

# JWT Error Handlers - This is crucial for debugging
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({"message": "Token has expired"}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({"message": "Invalid token"}), 422

@jwt.unauthorized_loader
def unauthorized_callback(error):
    return jsonify({"message": "Authorization required"}), 401

# Database configuration
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace("postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)

# Setup components
setup_admin(app)
setup_commands(app)
app.register_blueprint(api, url_prefix='/api')

@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0
    return response

if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)