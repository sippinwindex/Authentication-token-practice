# src/app.py - 
import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from api.models import db, User
from api.routes import api
from flask_jwt_extended import JWTManager
from datetime import timedelta

# Determine environment
ENV = os.getenv("FLASK_ENV", "production")
static_file_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../dist/')

app = Flask(__name__)
app.url_map.strict_slashes = False

# CORS Configuration for production
CORS(app, resources={
    r"/*": {
        "origins": ["*"],  # In production, restrict this to your domain
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# JWT Configuration
jwt_secret = os.getenv('JWT_SECRET_KEY', 'c5d31c781e8778ce21fa90343624ab197005cf9ba09571a4b9ab14d1d2b9c924')
flask_secret = os.getenv('SECRET_KEY', 'd1d0aabfc292f761c393f8a8a035b1621c23fc27b0d660a91aa3a6ee6726d0b5')

app.config['SECRET_KEY'] = flask_secret
app.config['JWT_SECRET_KEY'] = jwt_secret
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)

# Initialize JWT
jwt = JWTManager(app)

# JWT Error Handlers
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({"message": "Token has expired"}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error_string):
    return jsonify({"message": "Invalid token"}), 422

@jwt.unauthorized_loader
def unauthorized_callback(error_string):
    return jsonify({"message": "Authorization required"}), 401

# Database configuration - Use SQLite for Vercel
# In production, you'd want to use a proper database service
app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///invoice_app.db"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
db.init_app(app)

# Create tables
with app.app_context():
    db.create_all()

# Register blueprint
app.register_blueprint(api, url_prefix='/api')

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({"message": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"message": "Internal server error"}), 500

# Routes
@app.route('/')
def index():
    return send_from_directory(static_file_dir, 'index.html')

@app.route('/health')
def health_check():
    return jsonify({
        "status": "healthy",
        "environment": ENV,
        "jwt_configured": bool(app.config.get('JWT_SECRET_KEY'))
    })

@app.route('/<path:path>')
def serve_static(path):
    if os.path.exists(os.path.join(static_file_dir, path)):
        return send_from_directory(static_file_dir, path)
    return send_from_directory(static_file_dir, 'index.html')

# Vercel serverless function handler
def handler(request):
    return app(request.environ, lambda *args: None)

# For local development
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=(ENV == "development"))