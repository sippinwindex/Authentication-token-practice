from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from datetime import datetime
from werkzeug.security import check_password_hash, generate_password_hash
from .models import db, Invoice, User

# Create the Blueprint
api = Blueprint('api', __name__)

# Authentication Routes
@api.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data:
        return jsonify({"msg": "Missing JSON in request"}), 400
    
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"msg": "Email and password are required"}), 400
    
    # Check if user already exists
    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "User already exists"}), 400
    
    # Create new user
    hashed_password = generate_password_hash(password)
    new_user = User(
        email=email,
        password=hashed_password,
        is_active=True
    )
    
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"msg": "User created successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": f"An error occurred: {e}"}), 500

@api.route('/token', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data:
        return jsonify({"msg": "Missing JSON in request"}), 400
    
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"msg": "Email and password are required"}), 400
    
    # Find user
    user = User.query.filter_by(email=email).first()
    
    if not user or not check_password_hash(user.password, password):
        return jsonify({"msg": "Invalid email or password"}), 401
    
    # Create access token
    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({
        "access_token": access_token,
        "user": user.serialize()
    }), 200

# Invoice Routes
@api.route('/invoices', methods=['GET'])
@jwt_required()
def get_invoices():
    current_user_id = get_jwt_identity()
    
    invoices = Invoice.query.filter_by(user_id=int(current_user_id)).all()
    
    return jsonify([invoice.serialize() for invoice in invoices]), 200

@api.route('/invoices/<int:invoice_id>', methods=['GET'])
@jwt_required()
def get_single_invoice(invoice_id):
    current_user_id = get_jwt_identity()
    
    # Find the specific invoice that belongs to the current user
    invoice = Invoice.query.filter_by(id=invoice_id, user_id=int(current_user_id)).first()
    
    if not invoice:
        return jsonify({"msg": "Invoice not found or you don't have permission"}), 404
    
    return jsonify(invoice.serialize()), 200


@api.route('/invoices', methods=['POST'])
@jwt_required()
def create_invoice():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data:
        return jsonify({"msg": "Missing JSON in request"}), 400
    
    invoice_number = data.get('invoice_number')
    invoice_amount = data.get('invoice_amount')
    invoice_date = data.get('invoice_date')
    
    if not all([invoice_number, invoice_amount]):
        return jsonify({"msg": "Invoice number and amount are required"}), 400
    
    try:
        amount = float(invoice_amount)
        if amount < 0:
            return jsonify({"msg": "Invoice amount cannot be negative"}), 400
    except (ValueError, TypeError):
        return jsonify({"msg": "Invalid invoice amount"}), 400
    
    # Parse date if provided
    parsed_date = None
    if invoice_date:
        try:
            parsed_date = datetime.strptime(invoice_date, '%Y-%m-%d').date()
        except (ValueError, TypeError):
            return jsonify({"msg": "Invalid date format. Use YYYY-MM-DD."}), 400
    
    new_invoice = Invoice(
        invoice_number=invoice_number,
        invoice_amount=amount,
        invoice_date=parsed_date or datetime.now().date(),
        user_id=int(current_user_id)
    )
    
    try:
        db.session.add(new_invoice)
        db.session.commit()
        return jsonify(new_invoice.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": f"An error occurred: {e}"}), 500

@api.route('/invoices/<int:invoice_id>', methods=['PUT'])
@jwt_required()
def update_invoice(invoice_id):
    current_user_id = get_jwt_identity()
    
    # Find the specific invoice that belongs to the current user
    invoice_to_update = Invoice.query.filter_by(id=invoice_id, user_id=int(current_user_id)).first()

    if not invoice_to_update:
        return jsonify({"msg": "Invoice not found or you don't have permission"}), 404
    
    data = request.get_json()
    if not data:
        return jsonify({"msg": "Missing JSON in request"}), 400

    # Update amount if provided
    if 'invoice_amount' in data:
        try:
            amount = float(data['invoice_amount'])
            if amount < 0:
                return jsonify({"msg": "Invoice amount cannot be negative"}), 400
            invoice_to_update.invoice_amount = amount
        except (ValueError, TypeError):
            return jsonify({"msg": "Invalid invoice amount"}), 400

    # Update date if provided
    if 'invoice_date' in data:
        try:
            invoice_to_update.invoice_date = datetime.strptime(data['invoice_date'], '%Y-%m-%d').date()
        except (ValueError, TypeError):
            return jsonify({"msg": "Invalid date format. Use YYYY-MM-DD."}), 400
    
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": f"An error occurred while updating: {e}"}), 500

    return jsonify(invoice_to_update.serialize()), 200

@api.route('/invoices/<int:invoice_id>', methods=['DELETE'])
@jwt_required()
def delete_invoice(invoice_id):
    current_user_id = get_jwt_identity()
    
    invoice_to_delete = Invoice.query.filter_by(id=invoice_id, user_id=int(current_user_id)).first()

    if not invoice_to_delete:
        return jsonify({"msg": "Invoice not found or you don't have permission"}), 404

    try:
        db.session.delete(invoice_to_delete)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": f"An error occurred while deleting: {e}"}), 500
    
    return jsonify({"msg": "Invoice deleted successfully"}), 200