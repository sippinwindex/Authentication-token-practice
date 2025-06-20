# src/app.py - Compatible with SQLAlchemy 1.4
import os
from flask import Flask, request, jsonify, send_from_directory
from flask_migrate import Migrate
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

# CORS Configuration
CORS(app, resources={
    r"/*": {
        "origins": ["*"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# JWT Configuration
jwt_secret = os.getenv('JWT_SECRET_KEY', 'c5d31c781e8778ce21fa90343624ab197005cf9ba09571a4b9ab14d1d2b9c924')
flask_secret = os.getenv('SECRET_KEY', 'd1d0aabfc292f761c393f8a8a035b1621c23fc27b0d660a91aa3a6ee6726d0b5')

print(f"🔑 Using JWT Secret: {jwt_secret[:20]}...")
print(f"🔑 Using Flask Secret: {flask_secret[:20]}...")

app.config['SECRET_KEY'] = flask_secret
app.config['JWT_SECRET_KEY'] = jwt_secret
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)

# Initialize JWT
jwt = JWTManager(app)

# Add this debug function to test JWT configuration
@app.route('/debug/jwt-config')
def debug_jwt_config():
    return jsonify({
        "jwt_secret_configured": bool(app.config.get('JWT_SECRET_KEY')),
        "jwt_secret_preview": app.config.get('JWT_SECRET_KEY', '')[:20] + "...",
        "flask_secret_configured": bool(app.config.get('SECRET_KEY'))
    })

# JWT Error Handlers with detailed logging
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    print(f"❌ JWT Error: Token expired for user {jwt_payload.get('sub', 'unknown')}")
    return jsonify({"message": "Token has expired"}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error_string):
    print(f"❌ JWT Error: Invalid token - {error_string}")
    return jsonify({"message": "Invalid token"}), 422

@jwt.unauthorized_loader
def unauthorized_callback(error_string):
    print(f"❌ JWT Error: Unauthorized - {error_string}")
    return jsonify({"message": "Authorization required"}), 401

# Add more JWT error handlers
@jwt.needs_fresh_token_loader
def token_not_fresh_callback(jwt_header, jwt_payload):
    print(f"❌ JWT Error: Token not fresh")
    return jsonify({"message": "Fresh token required"}), 401

@jwt.revoked_token_loader
def revoked_token_callback(jwt_header, jwt_payload):
    print(f"❌ JWT Error: Token revoked")
    return jsonify({"message": "Token has been revoked"}), 401

# Database configuration - Use SQLite for development to avoid PostgreSQL issues
db_url = os.getenv("DATABASE_URL")

# For development, prefer SQLite to avoid PostgreSQL/Python 3.13 compatibility issues
if ENV == "development":
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///invoice_app.db"
    print("🗄️ Using SQLite for development")
else:
    if db_url and db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://")
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url or "sqlite:///invoice_app.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
MIGRATE = Migrate(app, db)
db.init_app(app)

# Setup components
setup_admin(app)
setup_commands(app)

# Register blueprint
app.register_blueprint(api, url_prefix='/api')

# Error handlers
@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

@app.errorhandler(404)
def not_found(error):
    return jsonify({"message": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"message": "Internal server error"}), 500

# Routes
@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

@app.route('/health')
def health_check():
    return jsonify({
        "status": "healthy",
        "environment": ENV,
        "jwt_configured": bool(app.config.get('JWT_SECRET_KEY')),
        "database_configured": bool(app.config.get('SQLALCHEMY_DATABASE_URI'))
    })

@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0
    return response

if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))  # Backend on port 3001
    print(f"🚀 Starting Flask app on port {PORT}")
    print(f"🔧 Environment: {ENV}")
    print(f"🔑 JWT Secret configured: {bool(app.config.get('JWT_SECRET_KEY'))}")
    print(f"🗄️ Database: {app.config.get('SQLALCHEMY_DATABASE_URI')}")
    
    app.run(host='0.0.0.0', port=PORT, debug=True)