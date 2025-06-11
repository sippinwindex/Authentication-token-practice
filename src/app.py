"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from api.utils import APIException, generate_sitemap
from api.models import db, User  # This is correct
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from flask_jwt_extended import JWTManager
from datetime import timedelta # <<< --- ADDED THIS IMPORT
from werkzeug.security import generate_password_hash # ### ADDED ###

# from models import Person

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../dist/')

# Create Flask app ONCE
app = Flask(__name__)
app.url_map.strict_slashes = False

# Configure secrets FROM ENVIRONMENT VARIABLES
app.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET', 'a_default_fallback_secret_key') # Added fallback
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET', 'a_default_fallback_jwt_secret') # Added fallback
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)  # Add token expiration

# Initialize JWT AFTER configuring
jwt = JWTManager(app)

# database configuration
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace(
        "postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
MIGRATE = Migrate(app, db, compare_type=True) # Ensure db is initialized before Migrate if not already
db.init_app(app)

# Create test user in development
# This block will run when the app module is imported (e.g., by `flask run`)
from werkzeug.security import generate_password_hash # ### ADDED ###
# ... other imports ...

# ... app initialization ...

# ### NOTE ###: I've added password hashing to the development test user
# so that you can log in with "test@example.com" and "testpassword".
if ENV == "development":
    with app.app_context():
        db.create_all()
        if not User.query.filter_by(email="test@example.com").first():
            hashed_password = generate_password_hash("testpassword") # ### FIX ###
            test_user = User(
                email="test@example.com",
                password=hashed_password, # ### FIX ###
                is_active=True
            )
            db.session.add(test_user)
            db.session.commit()
            print("Test user created (test@example.com / testpassword).")
        else:
            print("Test user already exists.")


# add the admin
setup_admin(app)

# add the commands
setup_commands(app)

# Add all endpoints form the API with a "api" prefix
app.register_blueprint(api, url_prefix='/api')

# Handle/serialize errors like a JSON object
@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# generate sitemap with all your endpoints
@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

# any other endpoint will try to serve it like a static file
@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0  # avoid cache memory
    return response

# Removed the redundant test user creation block from here
# The block above will handle it during app initialization.

# this only runs if `$ python src/app.py` is executed directly (not with `flask run`)
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug= (ENV == "development") )
