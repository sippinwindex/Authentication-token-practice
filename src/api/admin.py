import os
from flask_admin import Admin
from api.models import db, User, Invoice  # Using explicit path from 'api' package
from flask_admin.contrib.sqla import ModelView

def setup_admin(app):
    app.secret_key = os.environ.get('FLASK_APP_KEY', 'sample key')
    app.config['FLASK_ADMIN_SWATCH'] = 'cerulean' # Sets the admin theme
    admin = Admin(app, name='4Geeks Admin', template_mode='bootstrap3') # Or 'bootstrap4' / 'bootstrap5' for newer themes

    # Add User model view
    admin.add_view(ModelView(User, db.session))

    # Add Invoice model view
    admin.add_view(ModelView(Invoice, db.session))