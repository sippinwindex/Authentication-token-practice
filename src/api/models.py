from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Integer, String, Boolean, Float, ForeignKey, Date # Ensure Integer is here
from sqlalchemy.orm import Mapped, mapped_column, relationship # Keep these for other fields for now
from datetime import date

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = "user"

    # Use db.Column for the primary key
    id = db.Column(db.Integer, primary_key=True)

    # You can keep Mapped for other columns if you wish, or change them too
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(120), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    invoices: Mapped[list["Invoice"]] = relationship(back_populates="user", cascade="all, delete-orphan")

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

    # Use db.Column for the primary key
    id = db.Column(db.Integer, primary_key=True)

    # Keep Mapped for others or change
    invoice_number: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    invoice_amount: Mapped[float] = mapped_column(Float, nullable=False)
    invoice_date: Mapped[date] = mapped_column(Date, nullable=False, default=date.today)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)

    user: Mapped["User"] = relationship(back_populates="invoices")

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