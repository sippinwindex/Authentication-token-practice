# src/api/models.py - Compatible with SQLAlchemy 1.4
from flask_sqlalchemy import SQLAlchemy
from datetime import date

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = "user"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)

    # Relationship to invoices
    invoices = db.relationship('Invoice', backref='user', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<User {self.email}>'

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "is_active": self.is_active,
        }

class Invoice(db.Model):
    __tablename__ = "invoice"

    id = db.Column(db.Integer, primary_key=True)
    invoice_number = db.Column(db.String(120), unique=True, nullable=False)
    invoice_amount = db.Column(db.Float, nullable=False)
    invoice_date = db.Column(db.Date, nullable=False, default=date.today)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def __repr__(self):
        return f'<Invoice {self.invoice_number}>'

    def serialize(self):
        return {
            "id": self.id,
            "invoice_number": self.invoice_number,
            "invoice_amount": self.invoice_amount,
            "invoice_date": self.invoice_date.isoformat() if self.invoice_date else None,
            "user_id": self.user_id
        }