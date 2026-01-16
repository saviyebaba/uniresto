from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class Utilisateur(db.Model):
    __tablename__ = 'utilisateur'
    id_utilisateur = db.Column(db.Integer, primary_key=True)
    matricule = db.Column(db.String(50), unique=True)
    nom = db.Column(db.String(100))
    prenom = db.Column(db.String(100))
    email = db.Column(db.String(120), unique=True, nullable=False)
    mot_de_passe = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20)) # Admin, Staff, Student
    is_active = db.Column(db.Boolean, default=True)
    quota_remaining = db.Column(db.Integer, default=10)

    def set_password(self, password):
        self.mot_de_passe = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.mot_de_passe, password)

class Menu(db.Model):
    __tablename__ = 'menu'
    id_menu = db.Column(db.Integer, primary_key=True)
    date_menu = db.Column(db.Date, nullable=False)
    type_repas = db.Column(db.String(50)) # Petit-déjeuner, Déjeuner, Dîner
    description = db.Column(db.Text)
    prix = db.Column(db.Float)
    image_url = db.Column(db.String(500))
    stock = db.Column(db.Integer, default=100) # Champ stock ajouté
    is_active = db.Column(db.Boolean, default=True)
    
    # Cascade delete to reservations when a menu is removed
    reservations_rel = db.relationship('Reservation', back_populates='menu', cascade="all, delete-orphan")

class Reservation(db.Model):
    __tablename__ = 'reservation'
    id_reservation = db.Column(db.Integer, primary_key=True)
    id_utilisateur = db.Column(db.Integer, db.ForeignKey('utilisateur.id_utilisateur'))
    id_menu = db.Column(db.Integer, db.ForeignKey('menu.id_menu'))
    original_date_menu = db.Column(db.Date)
    payment_method = db.Column(db.String(20))
    is_paid = db.Column(db.Boolean, default=False)
    status = db.Column(db.String(20), default='confirmed')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relations
    menu = db.relationship('Menu', back_populates='reservations_rel')
    ticket = db.relationship('Ticket', backref='reservation', uselist=False, cascade="all, delete-orphan")

class Ticket(db.Model):
    __tablename__ = 'ticket'
    id_ticket = db.Column(db.Integer, primary_key=True)
    id_reservation = db.Column(db.Integer, db.ForeignKey('reservation.id_reservation'))
    code = db.Column(db.String(50), unique=True)
    qr_code = db.Column(db.Text)
    is_used = db.Column(db.Boolean, default=False)
    used_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)