# src/api/routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from datetime import datetime
from werkzeug.security import check_password_hash, generate_password_hash
from .models import db, Invoice, User

api = Blueprint('api', __name__)

# === CORRECTED: USER REGISTRATION ===
@api.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400
    
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already registered"}), 409
    
    new_user = User(email=email, password=generate_password_hash(password), is_active=True)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User created successfully. Please log in."}), 201

# === CORRECTED: USER LOGIN ===
# The route is now /login and the response key is "token" to match the frontend.
@api.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400
    
    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({"message": "Invalid credentials"}), 401
    
    # Use user.id for the identity
    access_token = create_access_token(identity=user.id)
    return jsonify({
        "token": access_token, # <- CORRECTED KEY
        "user": user.serialize()
    }), 200

# === CORRECTED: INVOICE COLLECTION ROUTE ===
# Handles GET (all) and POST (create) for /invoices
@api.route('/invoices', methods=['GET', 'POST'])
@jwt_required()
def handle_invoices():
    current_user_id = get_jwt_identity()

    if request.method == 'GET':
        invoices = Invoice.query.filter_by(user_id=int(current_user_id)).all()
        # The response is now wrapped in an object to match the frontend
        return jsonify({"invoices": [invoice.serialize() for invoice in invoices]}), 200

    if request.method == 'POST':
        data = request.get_json()
        invoice_number = data.get('invoice_number') # Frontend sends this now
        invoice_amount = data.get('invoice_amount')
        invoice_date_str = data.get('invoice_date')

        if not all([invoice_number, invoice_amount]):
            return jsonify({"message": "Invoice number and amount are required"}), 400
        
        parsed_date = datetime.strptime(invoice_date_str, '%Y-%m-%d').date() if invoice_date_str else datetime.now().date()
        
        new_invoice = Invoice(
            invoice_number=invoice_number,
            invoice_amount=float(invoice_amount),
            invoice_date=parsed_date,
            user_id=int(current_user_id)
        )
        db.session.add(new_invoice)
        db.session.commit()
        return jsonify(new_invoice.serialize()), 201

# === CORRECTED: SINGLE INVOICE ROUTE ===
# Handles GET, PUT, and DELETE for /invoices/<id>
@api.route('/invoices/<int:invoice_id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def handle_single_invoice(invoice_id):
    current_user_id = get_jwt_identity()
    invoice = Invoice.query.filter_by(id=invoice_id, user_id=int(current_user_id)).first()

    if not invoice:
        return jsonify({"message": "Invoice not found or permission denied"}), 404

    if request.method == 'GET':
        return jsonify(invoice.serialize()), 200
        
    if request.method == 'PUT':
        data = request.get_json()
        if 'invoice_amount' in data:
            invoice.invoice_amount = float(data['invoice_amount'])
        if 'invoice_date' in data:
            invoice.invoice_date = datetime.strptime(data['invoice_date'], '%Y-%m-%d').date()
        db.session.commit()
        return jsonify(invoice.serialize()), 200

    if request.method == 'DELETE':
        db.session.delete(invoice)
        db.session.commit()
        return "", 204 # Standard successful DELETE response