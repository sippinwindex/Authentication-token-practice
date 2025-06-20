# src/api/routes.py - DEBUG VERSION with detailed logging
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token, decode_token
from datetime import datetime
from werkzeug.security import check_password_hash, generate_password_hash
from .models import db, Invoice, User
import traceback
import sys

api = Blueprint('api', __name__)

# === USER REGISTRATION ===
@api.route('/register', methods=['POST'])
def register():
    try:
        print("🔐 Registration attempt started")
        data = request.get_json()
        print(f"📥 Registration data received: {data}")
        
        if not data:
            print("❌ No data provided in registration")
            return jsonify({"message": "No data provided"}), 400
            
        email = data.get('email')
        password = data.get('password')
        
        print(f"📧 Email: {email}, Password length: {len(password) if password else 0}")
        
        if not email or not password:
            print("❌ Missing email or password")
            return jsonify({"message": "Email and password are required"}), 400
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            print(f"❌ User already exists: {email}")
            return jsonify({"message": "Email already registered"}), 409
        
        # Create new user
        print(f"👤 Creating new user: {email}")
        hashed_password = generate_password_hash(password)
        print(f"🔐 Password hashed successfully")
        
        new_user = User(
            email=email, 
            password=hashed_password, 
            is_active=True
        )
        
        print("💾 Adding user to database...")
        db.session.add(new_user)
        db.session.commit()
        
        print(f"✅ User created successfully: {email}")
        return jsonify({"message": "User created successfully. Please log in."}), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Registration error: {str(e)}")
        print(f"📍 Error type: {type(e).__name__}")
        traceback.print_exc()
        return jsonify({"message": f"Registration failed: {str(e)}"}), 500

# === USER LOGIN ===
@api.route('/login', methods=['POST'])
def login():
    try:
        print("🔐 Login attempt started")
        print(f"📥 Request method: {request.method}")
        print(f"📥 Request headers: {dict(request.headers)}")
        
        data = request.get_json()
        print(f"📥 Login data received: {data}")
        
        if not data:
            print("❌ No JSON data provided in login")
            return jsonify({"message": "No data provided"}), 400
            
        email = data.get('email')
        password = data.get('password')
        
        print(f"📧 Email: {email}")
        print(f"🔐 Password provided: {bool(password)}")
        
        if not email or not password:
            print("❌ Missing email or password")
            return jsonify({"message": "Email and password are required"}), 400
        
        # Find user
        print(f"🔍 Looking for user: {email}")
        try:
            user = User.query.filter_by(email=email).first()
            print(f"👤 User found: {bool(user)}")
        except Exception as db_error:
            print(f"❌ Database error finding user: {str(db_error)}")
            traceback.print_exc()
            return jsonify({"message": "Database error"}), 500
        
        if not user:
            print(f"❌ User not found: {email}")
            return jsonify({"message": "Invalid credentials"}), 401
            
        # Check password
        print("🔐 Checking password...")
        try:
            password_valid = check_password_hash(user.password, password)
            print(f"🔐 Password valid: {password_valid}")
        except Exception as pwd_error:
            print(f"❌ Password check error: {str(pwd_error)}")
            return jsonify({"message": "Password verification failed"}), 500
            
        if not password_valid:
            print(f"❌ Invalid password for: {email}")
            return jsonify({"message": "Invalid credentials"}), 401
        
        print(f"✅ User authenticated: {email}")
        
        # Create token
        print("🔑 Creating JWT token...")
        try:
            # Convert user.id to string for JWT compatibility
            access_token = create_access_token(identity=str(user.id))
            print(f"🔑 Token created successfully: {access_token[:30]}...")
        except Exception as token_error:
            print(f"❌ Token creation failed: {str(token_error)}")
            print(f"📍 Token error type: {type(token_error).__name__}")
            traceback.print_exc()
            return jsonify({"message": f"Token creation failed: {str(token_error)}"}), 500
        
        # Prepare response
        try:
            user_data = user.serialize()
            print(f"👤 User data serialized: {user_data}")
        except Exception as serialize_error:
            print(f"❌ User serialization failed: {str(serialize_error)}")
            user_data = {"id": user.id, "email": user.email}
        
        response_data = {
            "token": access_token,
            "access_token": access_token,
            "user": user_data
        }
        
        print(f"✅ Login successful for: {email}")
        return jsonify(response_data), 200
        
    except Exception as e:
        print(f"❌ Unexpected login error: {str(e)}")
        print(f"📍 Error type: {type(e).__name__}")
        print(f"📍 Error args: {e.args}")
        traceback.print_exc()
        return jsonify({"message": f"Login failed: {str(e)}"}), 500

# === GET CURRENT USER ===
@api.route('/user', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        current_user_id_str = get_jwt_identity()
        current_user_id = int(current_user_id_str)  # Convert back to int
        print(f"🔍 Getting user info for ID: {current_user_id}")
        
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({"message": "User not found"}), 404
            
        return jsonify({"user": user.serialize()}), 200
        
    except Exception as e:
        print(f"❌ Get user error: {str(e)}")
        return jsonify({"message": "Failed to get user information"}), 500

# === INVOICE COLLECTION ROUTE ===
@api.route('/invoices', methods=['GET', 'POST'])
@jwt_required()
def handle_invoices():
    try:
        current_user_id_str = get_jwt_identity()
        current_user_id = int(current_user_id_str)  # Convert back to int
        print(f"🔍 Processing invoices request for user ID: {current_user_id}")

        if request.method == 'GET':
            invoices = Invoice.query.filter_by(user_id=current_user_id).all()
            print(f"📋 Found {len(invoices)} invoices for user {current_user_id}")
            return jsonify({"invoices": [invoice.serialize() for invoice in invoices]}), 200

        elif request.method == 'POST':
            data = request.get_json()
            if not data:
                return jsonify({"message": "No data provided"}), 400
                
            invoice_number = data.get('invoice_number')
            invoice_amount = data.get('invoice_amount')
            invoice_date_str = data.get('invoice_date')

            if not all([invoice_number, invoice_amount]):
                return jsonify({"message": "Invoice number and amount are required"}), 400
            
            # Check if invoice number already exists
            existing_invoice = Invoice.query.filter_by(invoice_number=invoice_number).first()
            if existing_invoice:
                return jsonify({"message": "Invoice number already exists"}), 409
            
            try:
                parsed_date = datetime.strptime(invoice_date_str, '%Y-%m-%d').date() if invoice_date_str else datetime.now().date()
            except ValueError:
                return jsonify({"message": "Invalid date format. Use YYYY-MM-DD"}), 400
            
            new_invoice = Invoice(
                invoice_number=invoice_number,
                invoice_amount=float(invoice_amount),
                invoice_date=parsed_date,
                user_id=current_user_id  # Already converted to int
            )
            
            db.session.add(new_invoice)
            db.session.commit()
            
            print(f"✅ Invoice created successfully: {invoice_number}")
            return jsonify(new_invoice.serialize()), 201
            
    except Exception as e:
        db.session.rollback()
        print(f"❌ Invoice handling error: {str(e)}")
        traceback.print_exc()
        return jsonify({"message": "Failed to process invoice request"}), 500

# === SINGLE INVOICE ROUTE ===
@api.route('/invoices/<int:invoice_id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def handle_single_invoice(invoice_id):
    try:
        current_user_id_str = get_jwt_identity()
        current_user_id = int(current_user_id_str)  # Convert back to int
        invoice = Invoice.query.filter_by(id=invoice_id, user_id=current_user_id).first()

        if not invoice:
            return jsonify({"message": "Invoice not found or permission denied"}), 404

        if request.method == 'GET':
            return jsonify(invoice.serialize()), 200
            
        elif request.method == 'PUT':
            data = request.get_json()
            if not data:
                return jsonify({"message": "No data provided"}), 400
                
            if 'invoice_amount' in data:
                invoice.invoice_amount = float(data['invoice_amount'])
            if 'invoice_date' in data:
                try:
                    invoice.invoice_date = datetime.strptime(data['invoice_date'], '%Y-%m-%d').date()
                except ValueError:
                    return jsonify({"message": "Invalid date format. Use YYYY-MM-DD"}), 400
                    
            db.session.commit()
            print(f"✅ Invoice updated successfully: {invoice.invoice_number}")
            return jsonify(invoice.serialize()), 200

        elif request.method == 'DELETE':
            db.session.delete(invoice)
            db.session.commit()
            print(f"✅ Invoice deleted successfully: {invoice.invoice_number}")
            return "", 204
            
    except Exception as e:
        db.session.rollback()
        print(f"❌ Single invoice error: {str(e)}")
        traceback.print_exc()
        return jsonify({"message": "Failed to process invoice request"}), 500

# === MANUAL TOKEN TEST ===
@api.route('/debug/test-token', methods=['POST'])
def debug_test_token():
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return jsonify({"error": "No token provided"}), 400
        
        print(f"🔍 Testing token: {token[:30]}...")
        
        # Try to decode the token manually
        try:
            decoded = decode_token(token)
            print(f"✅ Token decoded successfully: {decoded}")
            return jsonify({
                "status": "valid",
                "decoded": decoded
            }), 200
        except Exception as decode_error:
            print(f"❌ Token decode failed: {str(decode_error)}")
            return jsonify({
                "status": "invalid",
                "error": str(decode_error)
            }), 422
            
    except Exception as e:
        print(f"❌ Debug test token error: {str(e)}")
        return jsonify({"error": str(e)}), 500

# === TEST ROUTES ===
@api.route('/debug/users', methods=['GET'])
def debug_users():
    try:
        users = User.query.all()
        user_list = [{"id": u.id, "email": u.email, "is_active": u.is_active} for u in users]
        print(f"📋 Found {len(users)} users in database")
        return jsonify({
            "total_users": len(users),
            "users": user_list
        }), 200
    except Exception as e:
        print(f"❌ Error getting users: {str(e)}")
        return jsonify({"error": str(e)}), 500

@api.route('/test', methods=['GET'])
def test_route():
    print("🧪 Test route accessed")
    return jsonify({
        "message": "API is working!",
        "timestamp": datetime.now().isoformat()
    }), 200

@api.route('/test-auth', methods=['GET'])
@jwt_required()
def test_auth():
    try:
        print("🧪 Auth test route accessed")
        print(f"📥 Request headers: {dict(request.headers)}")
        
        current_user_id = get_jwt_identity()
        print(f"🧪 Auth test for user: {current_user_id} (type: {type(current_user_id)})")
        
        # Convert back to int for database operations
        user_id_int = int(current_user_id)
        
        return jsonify({
            "message": "Authentication working!",
            "user_id": user_id_int,
            "user_id_string": current_user_id,
            "timestamp": datetime.now().isoformat()
        }), 200
    except Exception as e:
        print(f"❌ Auth test error: {str(e)}")
        print(f"📍 Error type: {type(e).__name__}")
        traceback.print_exc()
        return jsonify({"message": f"Authentication test failed: {str(e)}"}), 500