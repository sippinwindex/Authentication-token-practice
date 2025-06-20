"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from flask_cors import CORS  # Ensure this is included
from api.utils import APIException, generate_sitemap
from api.models import db, User
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from flask_jwt_extended import JWTManager
from datetime import timedelta
from werkzeug.security import generate_password_hash

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../dist/')

# Create Flask app
app = Flask(__name__)
app.url_map.strict_slashes = False

# Configure CORS
CORS(app, resources={r"/api/*": {"origins": ["https://refactored-meme-wr5j9qggjwgjh5vqp-3000.app.github.dev"]}})  # Allow frontend origin

# Configure secrets
app.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET', 'a_default_fallback_secret_key')
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET', 'a_default_fallback_jwt_secret')
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)

# Initialize JWT
jwt = JWTManager(app)

# Database configuration
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace("postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)

# Create test user in development
if ENV == "development":
    with app.app_context():
        db.create_all()
        if not User.query.filter_by(email="test@example.com").first():
            hashed_password = generate_password_hash("testpassword")
            test_user = User(
                email="test@example.com",
                password=hashed_password,
                is_active=True
            )
            db.session.add(test_user)
            db.session.commit()
            print("Test user created (test@example.com / testpassword).")
        else:
            print("Test user already exists.")

# Add admin and commands
setup_admin(app)
setup_commands(app)

# Register API blueprint
app.register_blueprint(api, url_prefix='/api')

# Handle API errors
@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# Serve sitemap or frontend
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
    app.run(host='0.0.0.0', port=PORT, debug=(ENV == "development"))