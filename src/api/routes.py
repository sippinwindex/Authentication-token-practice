# src/api/routes.py

# ... (keep all existing imports and routes)

# ### NEW ###: Add a route to update an existing invoice
@api.route('/invoices/<int:invoice_id>', methods=['PUT'])
@jwt_required()
def update_invoice(invoice_id):
    current_user_id = get_jwt_identity() # This is a string, needs to be int
    
    # Find the specific invoice that belongs to the current user
    invoice_to_update = Invoice.query.filter_by(id=invoice_id, user_id=int(current_user_id)).first()

    if not invoice_to_update:
        return jsonify({"msg": "Invoice not found or you don't have permission"}), 404
    
#if user is None:
#   return jsonify({ 'message': 'Sorry email or password not found'}), 401
#elif user is not None and user.password != password:
#   return jsonify({'message': 'Sorry email or password not found'}). 401

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


# ### NEW ###: Add a route to delete an invoice
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